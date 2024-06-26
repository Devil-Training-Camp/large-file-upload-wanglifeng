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
const partList = ref<Part[]>([]); // 切片列表
const upload = ref<boolean>(true);
const hash = ref<string>(""); // 文件 hash

const fileStorageDB: fileStorageDBService = inject(
  "fileStorageDB",
) as fileStorageDBService;

onMounted(async () => {
  // 初始化 fileStorageDB 存储
  await fileStorageDB.openDB({
    [STORE_NAME]: {
      indexs: [HASH_KEY],
    },
  });
});

// 上传文件控件触发事件
function handleChange(e: Event) {
  const postFiles = Array.prototype.slice.call(
    (e.target as HTMLInputElement).files,
  );
  if (!postFiles || postFiles.length == 0) {
    return;
  }
  postFiles.forEach((item) => {
    handleUpload(item);
  });
}

// 处理多文件上传
function handleUpload(rawFile: FileData) {
  rawFile.totalPercentage = 0;
  rawFile.hashPercentage = 0;
  fileList.value.push(rawFile);
}

// 上传切片文件到服务器
const submitUpload = async () => {
  if (!fileList) {
    ElMessage.error("您尚未上传文件！");
    return;
  }

  for (let i = 0; i < fileList.value.length; i++) {
    // 1.生成文件切片
    const filePartList: Part[] = splitChunks(fileList.value[i]);
    // 2.计算 hash 值
    hash.value = await calculateHash(filePartList);
    let fileName: string = fileList.value[i].name,
      fileHash: string = hash.value;
    // 3.校验文件是否需要上传
    const { needUpload, uploadedList } = await verify({ fileName, fileHash });
    // 如果上传过，不需要上传，秒传
    if (!needUpload) {
      ElMessage.success("秒传：上传成功");
      continue;
    }
    // 4.组织切片数据，上传切片
    partList.value = filePartList.map((item, index) => ({
      ...item,
      chunkHash: `${hash.value}-${index}`,
      fileHash: hash.value,
      index,
      progress: 0,
    }));
    await uploadParts(
      {
        fileItem: fileList.value[i],
        partList: partList.value,
        hash: hash.value,
        totalPartsCount: partList.value.length,
        uploadedParts: 0,
      },
      fileList.value,
      i,
    );
  }
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
        fileHash: hash.value,
      });
      const newParts = partList.value.filter((item) => {
        return !uploadedList.includes(item.hash || "");
      });

      // 如果上传过，不需要上传，秒传
      if (!needUpload) {
        ElMessage.success("秒传：上传成功");
        return;
      } else {
        await uploadParts(
          {
            fileItem: currentFile,
            partList: newParts,
            hash: hash.value,
            totalPartsCount: partList.value.length,
            uploadedParts: partList.value.length - newParts.length,
          },
          fileList.value,
          i,
        );
      }
    }
  } else {
    // 暂停上传
    // abortAll();
  }
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
