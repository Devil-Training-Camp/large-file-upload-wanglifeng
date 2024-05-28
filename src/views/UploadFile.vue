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
          <el-button type="primary" @click="handleUpload">上传</el-button>
          <el-button type="warning" @click="handlePause">{{
            upload ? "暂停" : "继续"
          }}</el-button>
        </div>
      </div>
    </div>
    <div class="file-wrapper"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { UploadFile, UploadProps } from "element-plus";
import { CHUNK_SIZE } from "@/const";
import { ElMessage, ElUpload } from "element-plus";
import { Part, UploadPartControllerParams, UploadPartParams } from "@/types";
import { mergePart, uploadPart, verify } from "@/service/file";
import Scheduler from "../utils/scheduler";
import { calculateHash } from "../utils/hash";
import { splitChunks } from "../utils/chunk";

const file = ref<UploadFile | null>(null);
const fileParts = ref<Part[]>([]);
const upload = ref<boolean>(true);
const uploaded = ref<boolean>(false);
const controllerMap = new Map<number, AbortController>();
let filename = "";

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
  let partList: Part[] = splitChunks(file.value.raw);
  let fileHash: string = await calculateHash(partList);
  let lastDotIndex = file.value.raw?.name.lastIndexOf(".");
  let extname = file.value.raw?.name.slice(lastDotIndex);
  filename = `${fileHash}${extname}`;
  partList = partList.map((part, index: number) => ({
    filename, //文件名
    chunkName: `${filename}-${index}`, //分块的名称
    chunk: part.chunk, // 分块
    size: part.chunk.size, // 分块的大小
    percent: 0,
  }));

  fileParts.value = partList;
  const { needUpload } = (await verify({ filename })) as any;
  if (needUpload) {
    await uploadParts({
      partList,
      filename,
      partsTotal: partList.length,
      uploadedPartsCount: 0,
    });
  } else {
    ElMessage.success("秒传成功！");
  }
};

// 上传切片
async function uploadParts({
  partList,
  filename,
  partsTotal,
  uploadedPartsCount,
  limit = 3,
}: UploadPartParams) {
  const scheduler = new Scheduler(limit);
  for (let i = 0; i < partList.length; i++) {
    const { chunk } = partList[i];
    let cName = "";
    if (partList[i].chunkName) {
      cName = partList[i].chunkName as string;
    } else {
      cName = `${filename}-${partList.indexOf(partList[i])}`;
    }

    const params = {
      part: chunk,
      partName: cName,
      filename: filename,
    } as UploadPartControllerParams;

    const task = async () => {
      const controller = new AbortController();
      controllerMap.set(i, controller);
      const { signal } = controller;

      return await uploadPart(params, onTick, i, signal);
    };
    scheduler.add(() => {
      return task()
        .then(() => {
          uploadedPartsCount++;
          // 判断切片都上传完成时，进行切片合并
          if (uploadedPartsCount == partsTotal) {
            async () => {
              await mergePart({ filename });
            };
          }
        })
        .catch((err) => {
          throw err;
        });
    });
  }
}

async function handlePause() {
  upload.value = !upload.value;
  if (!upload.value) {
    controllerMap.forEach((controller, index) => {
      controller.abort();
    });
    controllerMap.clear();
  } else {
    await uploadParts({
      partList: fileParts.value,
      filename: filename,
      partsTotal: fileParts.value.length,
      uploadedPartsCount: 0,
    });
  }
}

// 上传进度
function onTick(index: number, percent: number) {}
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
