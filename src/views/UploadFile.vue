<template>
  <div class="upload-container">
    <div class="upload-wrapper">
      <!-- 看起来没有支持多文件上传，减分 -->
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
import Worker from "../utils/hash_worker.ts?worker";
import { mergePart, uploadPart, verify } from "@/service/file";
import Scheduler from "../utils/scheduler";

const file = ref<UploadFile | null>(null);
const fileParts = ref<Part[]>([]);
const upload = ref<boolean>(true);
// 下面两个变量好像都没用到
const uploaded = ref<boolean>(false);
const hash = ref<string>("");
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
  // 应该不能叫 create，而是 split
  let partList: Part[] = createChunks(file.value.raw);
  let fileHash: string = await calculateHash(partList);
  // 有一个 path-browser 的库适合在这里用
  // 即使不用外部库，下面这两句的逻辑也比较独立，适合单独封装
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
    // 下面这几行可以优化成一行
    // const cName = partList[i].chunkName || `${filename}-${partList.indexOf(partList[i])}`
    // 另外，尽量规避使用 let，优先用 const
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
      // async-await
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

// 这些 hash、chunk 之类的计算都应该抽出去，不要都混在一起
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
