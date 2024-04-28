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

const file = ref<UploadFile | null>(null);
const upload = ref<boolean>(true);
const hash = ref<string>("");

// 文件上传事件
const handleChange: UploadProps["onChange"] = (rawFile) => {
  file.value = rawFile;
};

// 计算切片hash
const calculateHash = (partList: Part[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    let worker = new Worker("../utils/hash_worker.js");
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
  padding: 20px;
  font-size: 14px;
  .upload-wrapper {
    width: 200px;
  }
}
</style>
