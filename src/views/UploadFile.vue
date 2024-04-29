<template>
  <div class="upload-container">
    <div class="upload-wrapper">
      <div class="upload-com">
        <el-upload
          :on-change="handleChange"
          drag
          :action="''"
          multiple
          :auto-upload="false"
          :show-file-list="false"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">将文件放到这里或 <em>选择文件</em></div>
        </el-upload>
      </div>
      <div class="btn-list">
        <div class="btns">
          <el-button
            type="primary"
            @click="handleUpload"
            v-if="uploadStatus == UploadStatus.INIT"
            >上传</el-button
          >
          <el-button
            type="primary"
            v-else-if="uploadStatus == UploadStatus.UPLOADING"
            >暂停</el-button
          >
          <el-button type="primary" v-if="uploadStatus == UploadStatus.PAUSE"
            >继续</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { UploadFile, UploadProps } from "element-plus";
import { CHUNK_SIZE } from "@/const";
import { ElMessage, ElUpload } from "element-plus";
import { Part } from "@/types";
import Worker from "../utils/hash_worker.ts?worker";

const file = ref<UploadFile | null>(null);
const upload = ref<boolean>(true);
const hash = ref<string>("");

// 定义文件上传状态
enum UploadStatus {
  INIT, //初始态
  PAUSE, //暂停中
  UPLOADING, //上传中
}
let uploadStatus = UploadStatus.INIT;

// 文件上传事件
const handleChange: UploadProps["onChange"] = (rawFile) => {
  file.value = rawFile;
};

// 上传文件到服务器
const handleUpload = async () => {
  if (!file.value) {
    ElMessage.error("您尚未上传文件！");
    return;
  }
  let partList: Part[] = createChunks(file.value.raw);
  let fileHash: string = await calculateHash(partList);
  let lastDotIndex = file.value.raw?.name.lastIndexOf(".");
  let extname = file.value.raw?.slice(lastDotIndex);
  let filename = `${fileHash}${extname}`;
  partList = partList.map((part, index: number) => ({
    filename, //文件名
    chunk_name: `${filename}-${index}`, //分块的名称
    chunk: part.chunk, //代码块
    size: part.chunk.size, //此代码块的大小
  }));
  await uploadParts(partList, filename);
};

// 上传切片
async function uploadParts(partList: Part[], filename: string) {
  
}

// 计算切片hash
const calculateHash = (partList: Part[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    let worker = new Worker();
    worker.postMessage({ partList });
    worker.onmessage = (event) => {
      const { percent, hash } = event.data;
      if (hash) {
        resolve(hash);
      }
    };
  });
};

// 文件切片
function createChunks(file: any): Part[] {
  const partList: Part[] = [];
  let current = 0;
  while (current < file.size!) {
    const chunk = file.slice(current, current + CHUNK_SIZE);
    partList.push({
      chunk,
      size: chunk.size,
    });
    current += CHUNK_SIZE;
  }
  return partList;
}
</script>

<style lang="scss" scoped>
.upload-container {
  display: flex;
  padding: 20px;
  font-size: 14px;
  .upload-wrapper {
    width: 400px;
    height: 420px;
  }
}
</style>
