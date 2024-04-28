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
            v-if="uploadStatus == UploadStatus.INIT"
            @click="handleUpload"
            >上传</el-button
          >
          <el-button
            type="primary"
            v-else-if="uploadStatus == UploadStatus.UPLOADING"
            >暂停</el-button
          >
          <el-button
            type="primary"
            v-else-if="uploadStatus == UploadStatus.PAUSE"
            >恢复</el-button
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
import { resolve } from "dns";
import Worker from "../utils/hash_worker.ts?worker";

enum UploadStatus {
  INIT, // 初始化
  PAUSE, //暂停中
  UPLOADING, //上传中
}

const file = ref<UploadFile | null>(null);
const upload = ref<boolean>(true);
const hash = ref<string>("");
let uploadStatus = UploadStatus.INIT;

// 文件上传事件
const handleChange: UploadProps["onChange"] = (rawFile) => {
  file.value = rawFile;
};

const handleUpload = async () => {
  if (!file.value) {
    ElMessage.error("您尚未选择文件！");
    return;
  }
  uploadStatus = UploadStatus.INIT;
  debugger;
  // 将文件切片
  let current = 0;
  const partList: Part[] = [];
  while (current < file.value!.raw!.size) {
    const chunk = file.value!.raw!.slice(current, current + CHUNK_SIZE);
    partList.push({ chunk, size: chunk.size });
    current += CHUNK_SIZE;
  }

  // 计算切片hash
  hash.value = await calculateHash(partList);
  console.log(hash.value);
};

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
</script>

<style lang="scss" scoped>
.upload-container {
  display: flex;
  padding: 30px;
  font-size: 14px;
  flex-direction: column;
  .upload-wrapper {
    width: 400px;
    height: 420px;
    text-align: center;
    .btn-list {
      display: flex;
      flex-direction: column;
      padding: 20px 30px;

      .btns {
        display: flex;
      }
    }
  }
}
</style>
