<template>
  <div class="upload-container">
    <div class="upload-wrapper">
      <div class="btn-list">
        <div class="btns">
          <el-button-group>
            <el-button>
              <el-icon><Upload /></el-icon>选择文件
              <input
                type="file"
                multiple
                class="select-file-input"
                @change="handleChange"
              />
            </el-button>
            <el-button @click="submitUpload"
              ><el-icon class="el-icon--upload"><upload-filled /></el-icon>上传
            </el-button>
            <el-button @click="handlePause" :disabled="!upload"
              ><el-icon><VideoPause /></el-icon>暂停</el-button
            >
            <el-button @click="handlePause" :disabled="upload"
              ><el-icon><VideoPlay /></el-icon>恢复</el-button
            >
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="file-wrapper">
      <FileItem :fileList="fileList" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import { CHUNK_SIZE, HASH_KEY, STORE_NAME } from "@/const";
import { ElMessage, ElUpload } from "element-plus";
import FileItem from "@/components/FileItem.vue";
import { FileData, Part } from "@/types/file";
import { uploadPart, verify } from "@/service/file";
import Scheduler from "../utils/scheduler";
import { splitChunks, uploadParts } from "../utils/file";
import { calculateHash } from "../utils/hash";
import { fileStorageDBService } from "@/utils/fileStorageDBService";

const fileList = ref<FileData[]>([]); // 上传文件列表
const upload = ref<boolean>(true); // 判断是否可以暂停
// 多文件上传使用切片索引做key，依次将请求放入controllersMap。暂停时统一控制
const controllersMap = new Map<number, AbortController>();

const fileStorageDB: fileStorageDBService = inject(
  "fileStorageDB"
) as fileStorageDBService;

onMounted(async () => {
  // 初始化 fileStorageDB 存储
  await fileStorageDB.openDB({
    [STORE_NAME]: {
      indexs: [HASH_KEY],
    },
  });

  // 获取本地存储的所有切片数据
  const storePartData = await fileStorageDB.getAllDatas<Part>(STORE_NAME);

  // 对切片数据进行分组
  const fileGroup: Record<string, Part[]> = storePartData.reduce(
    (groups: Record<string, Part[]>, item) => {
      const fileHash = item.fileHash!;
      if (!groups[fileHash]) {
        groups[fileHash] = [];
      }
      groups[fileHash].push(item);
      return groups;
    },
    {}
  );

  // 根据切片数据生成本地保存的文件列表
  Object.keys(fileGroup).forEach((item) => {
    const partArr = fileGroup[item];
    const uploadedCount = partArr.filter((p) => p.uploaded).length;
    const uploadPercentage = Number(
      ((uploadedCount / partArr.length) * 100).toFixed(0)
    );

    fileList.value.push({
      partList: partArr,
      fileHash: item,
      name: partArr.find(v => v.fileName)?.fileName || "",
      uploadPercentage: uploadPercentage,
      size: partArr.find(v => v.size)?.size || 0,
    });
  });
});

// 上传文件控件触发事件
function handleChange(e: Event) {
  const inputEle = e.target as HTMLInputElement;
  const files = inputEle.files;
  if (!files) return;

  fileList.value.push(...Array.from(files).map(preDealFile));

  // 清空上传控件文件
  inputEle.value = "";
}

// 预处理文件
const preDealFile = (file: File): FileData => {
  return {
    file,
    partList: [],
    uploadPercentage: 0,
    name: file.name,
    size: file.size,
  };
};

// 获取上传文件切片、文件hash
const submitUpload = async () => {
  if (!fileList) {
    ElMessage.error("您尚未上传文件！");
    return;
  }

  for (let i = 0; i < fileList.value.length; i++) {
    // 当前文件
    const currentFile = fileList.value[i];
    // 1.生成文件切片
    const filePartList: Part[] = splitChunks(currentFile.file!);
    // 2.计算 hash 值
    currentFile.fileHash = await calculateHash(filePartList);
    let fileName: string = currentFile.name,
      fileHash: string = currentFile.fileHash;
    // 3.校验文件是否需要上传
    const { needUpload } = await verify({ fileName, fileHash });
    // 如果上传过，不需要上传，秒传
    if (!needUpload) {
      fileList.value[i].uploadPercentage = 100;
      ElMessage.success("秒传：上传成功");
      continue;
    }
    // 4.组织切片数据
    currentFile.partList = filePartList.map((item, index) => ({
      ...item,
      fileName: fileName,
      [HASH_KEY]: `${fileHash}-${index}`,
      fileHash: fileHash,
      index,
    }));
    // 本地缓存切片数据
    await fileStorageDB.batchUpdateItem<Part>(STORE_NAME, currentFile.partList);
  }
  // 5.上传切片数据
  await uploadParts(
    {
      fileArr: fileList.value,
    },
    controllersMap
  );
};

// 暂停/恢复上传
async function handlePause() {
  upload.value = !upload.value;
  if (upload.value) {
    // 检查是否有上传文件
    if (!fileList.value || fileList.value.length == 0) {
      return;
    }
    for (let i = 0; i < fileList.value.length; i++) {
      const currentFile = fileList.value[i];
      // 校验文件是否上传过
      const { needUpload, uploadedList } = await verify({
        fileName: currentFile.name,
        fileHash: currentFile.fileHash!,
      });
      const newParts = currentFile.partList!.filter((item) => {
        return !uploadedList.includes(item.hashKey || "");
      });
      currentFile.partList = newParts;

      // 如果上传过，不需要上传，秒传
      if (!needUpload) {
        fileList.value[i].uploadPercentage = 100;
        ElMessage.success("秒传：上传成功");
        return;
      } else {
        await uploadParts(
          {
            fileArr: fileList.value,
          },
          controllersMap
        );
      }
    }
  } else {
    // 暂停上传
    abortAll();
  }
}

// 暂停所有上传
function abortAll() {
  controllersMap.forEach((controller, index) => {
    controller.abort();
  });
  controllersMap.clear();
}
</script>

<style lang="less" scoped>
.upload-container {
  width: 80%;
  border: 1px solid #d2d2d2;
  border-radius: 4px;
  background: #fff;
  padding: 10px;
  .btn-list {
    .btns {
      position: relative;
      .select-file-input {
        position: absolute;
        display: inline-block;
        left: 0;
        top: 0;
        border: none;
        opacity: 0;
        width: 96px;
        height: 28px;
      }
    }
  }
}
</style>
