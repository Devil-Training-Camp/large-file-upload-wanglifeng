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
            <el-button @click="handleUpload"
              ><el-icon class="el-icon--upload"><upload-filled /></el-icon>上传
            </el-button>
            <el-button @click="handlePause"
              ><el-icon><VideoPause /></el-icon>暂停</el-button
            >
            <el-button @click="handlePause"
              ><el-icon><VideoPlay /></el-icon>恢复</el-button
            >
            <el-button @click="clearFiles"
              ><el-icon><Delete /></el-icon>清空</el-button
            >
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="file-wrapper">
      <FileItem />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { CHUNK_SIZE } from "@/const";
import { ElMessage, ElUpload } from "element-plus";
import FileItem from "@/components/FileItem.vue";
import {
  Part,
  UploadedFile,
  UploadPartControllerParams,
  UploadPartParams,
} from "@/types";
import { mergePart, uploadPart, verify } from "@/service/file";
import Scheduler from "../utils/scheduler";
import { calculateHash } from "../utils/hash";
import { splitChunks } from "../utils/chunk";

const file = ref<File | null>(null);
const partList = ref<Part[]>([]);
const upload = ref<boolean>(true);
const hash = ref<string>("");

/**
 * @description: 上传文件控件触发事件
 * @param {*} e
 * @return {*}
 */
function handleChange(e) {
  const [fileObj] = e.target.files;
  if (!fileObj) {
    file.value = null;
    return;
  }
  file.value = fileObj;
}

/**
 * @description: 上传切片文件到服务器
 * @return {*}
 */
const handleUpload = async () => {
  if (!file.value) {
    ElMessage.error("您尚未上传文件！");
    return;
  }

  // 生成文件切片
  const filePartList: Part[] = splitChunks(file.value);
  // 计算 hash 值
  hash.value = await calculateHash(filePartList);
  let fileName: string = file.value.name,
    fileHash: string = hash.value;
  // 校验文件是否上传过
  const { needUpload, uploadedList } = await verify({ fileName, fileHash });

  if (!needUpload) {
    ElMessage.success("秒传：上传成功");
    return;
  }

  partList.value = filePartList.map((item, index) => ({
    ...item,
    chunkHash: `${hash.value}-${index}`,
    fileHash: hash.value,
    index,
    progress: 0,
  }));

  await uploadParts({
    partList: partList.value,
    hash: hash.value,
    partsTotal: partList.value.length,
    uploadedPartsCount: 0,
  });
};

// 上传切片
async function uploadParts({
  partList,
  hash,
  partsTotal,
  uploadedPartsCount,
  limit = 3,
}: UploadPartParams) {
  const scheduler = new Scheduler(limit);
  const totalParts = partList.length;
  let uploadedCount = 0;

  for (let i = 0; i < partList.length; i++) {
    const { chunk } = partList[i];

    let cHash = partList[i].hash? partList[i].hash as string: `${hash}-${partList.indexOf(partList[i])}`;
    
    const params = {
      part: chunk,
      hash:cHash,
      fileHash:hash,
      fileName: file.value?.name as string,
      size: file.value?.size,
    } as UploadPartControllerParams;

    
  }
}

async function handlePause() {
  upload.value = !upload.value;
  if (!upload.value) {
  } else {
    await uploadParts({
      partList: partList.value,
      hash: hash.value,
      partsTotal: partList.value.length,
      uploadedPartsCount: 0,
    });
  }
}

function clearFiles() {}

// 上传进度
function onTick(index: number, percent: number) {}
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
