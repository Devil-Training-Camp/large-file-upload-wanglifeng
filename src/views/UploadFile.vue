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
import {
  FileData,
  Part,
  UploadPartControllerParams,
  UploadPartParams,
} from "@/types/file";
import { mergePart, uploadPart, verify } from "@/service/file";
import Scheduler from "../utils/scheduler";
import { calculateHash } from "../utils/hash";
import { splitChunks } from "../utils/chunk";
import { fileStorageDBService } from "@/utils/fileStorageDBService";

const file = ref<File | null>(null);
const fileList = ref<FileData[]>([]);
const partList = ref<Part[]>([]);
const upload = ref<boolean>(true);
const hash = ref<string>("");
const controllersMap = new Map<number, AbortController>();
let fileIndex: number = 0; // 正在被遍历的文件下标

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

/**
 * @description: 上传文件控件触发事件
 * @param {*} e
 * @return {*}
 */
function handleChange(e) {
  const files = e.target.files;
  if (!files) {
    return;
  }
  fileIndex = 0; // 重置文件下标
  const postFiles = Array.prototype.slice.call(files);
  postFiles.forEach((item) => {
    handleUpload(item);
  });
}

/**
 * @description: 处理多文件上传
 * @param {*} rawFile
 * @return {*}
 */
function handleUpload(rawFile: FileData) {
  rawFile.totalPercentage = 0;
  rawFile.hashPercentage = 0;
  fileList.value.push(rawFile);
}

/**
 * @description: 上传切片文件到服务器
 * @return {*}
 */
const submitUpload = async () => {
  if (!fileList) {
    ElMessage.error("您尚未上传文件！");
    return;
  }

  for (let i = 0; i < fileList.value.length; i++) {
    fileIndex = i; // 获取文件索引，方便暂停/恢复
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
    await uploadParts({
      fileItem: fileList.value[i],
      partList: partList.value,
      hash: hash.value,
      totalPartsCount: partList.value.length,
      uploadedParts: 0,
    });
  }
};

/**
 * @description: 上传切片
 * @param {*} partList 切片列表
 * @param {*} hash 文件 hash值
 * @param {*} limit 最大请求数
 * @return {*}
 */
async function uploadParts({
  fileItem,
  partList,
  hash,
  totalPartsCount,
  uploadedParts,
  limit = 3,
}: UploadPartParams) {
  // 1.定义任务调度器
  const scheduler = new Scheduler(limit);
  // 2.遍历切片列表，将切片上传任务添加到任务调度
  for (let i = 0; i < partList.length; i++) {
    const { chunk } = partList[i];

    let pHash = partList[i].hash
      ? (partList[i].hash as string)
      : `${hash}-${partList.indexOf(partList[i])}`;

    const params = {
      part: chunk,
      hash: pHash,
      fileHash: hash,
      fileName: fileItem.name as string,
      size: fileItem.size,
    } as UploadPartControllerParams;

    const controller = new AbortController();
    controllersMap.set(i, controller);
    const { signal } = controller;

    const taskFn = async () => {
      return await uploadPart(params, onTick, i, signal);
    };
    scheduler.add(taskFn, i);
  }
  // 3.执行任务
  const { status } = await scheduler.done();
  // 4.任务执行成功，合并切片
  if (status == "success") {
    mergeRequest(fileItem);
  } else {
    ElMessage.error("文件上传失败");
  }

  function onTick(index: number, percent: number) {
    partList[index].percentage = percent;
    const newPartsProgress = partList.reduce(
      (sum, part) => sum + (part.percentage || 0),
      0,
    );
    const totalProgress =
      (newPartsProgress + uploadedParts * 100) / totalPartsCount;
    fileList.value[fileIndex].totalPercentage = Number(
      totalProgress.toFixed(2),
    );
  }
}

/**
 * @description: 切片合并请求
 * @return {*}
 */
async function mergeRequest(fileItem: FileData) {
  await mergePart({
    fileName: fileItem.name as string,
    size: CHUNK_SIZE,
    fileHash: hash.value,
  });
  ElMessage.success("文件上传成功");
}

/**
 * @description: 暂停/恢复上传
 * @return {*}
 */
async function handlePause() {
  upload.value = !upload.value;
  const currentFile = fileList.value[fileIndex];
  if (upload.value) {
    // 检查是否有上传文件
    if (!file.value?.name) {
      return;
    }

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
      await uploadParts({
        fileItem: currentFile,
        partList: newParts,
        hash: hash.value,
        totalPartsCount: partList.value.length,
        uploadedParts: partList.value.length - newParts.length,
      });
    }
  } else {
    // 暂停上传
    abortAll();
  }
}

// 所有请求暂停
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
@/types/file ../utils/chunk
