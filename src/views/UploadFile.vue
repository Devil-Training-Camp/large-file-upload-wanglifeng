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
import type { UploadFile } from "element-plus";
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

const file = ref<UploadFile | null>(null);
const partList = ref<Part[]>([]);
const upload = ref<boolean>(true);
const uploaded = ref<boolean>(false);
const hash = ref<string>("");

// 判断文件是否可以秒传
async function VerifyUpload(fileName: string, fileHash: string) {
  debugger;
  const data = await verify({ fileName, fileHash });
  return data;
}

// 文件上传事件
function handleChange(e) {
  const [fileObj] = e.target.files;
  if (!fileObj) {
    file.value = null;
    return;
  }
  file.value = fileObj;
}

// 上传文件到服务器
const handleUpload = async () => {
  if (!file.value) {
    ElMessage.error("您尚未上传文件！");
    return;
  }

  let filePartList: Part[] = splitChunks(file.value);
  hash.value = await calculateHash(filePartList);
  partList.value = filePartList.map((item, index) => ({
    ...item,
    chunkHash: `{hash.value}-${index}`,
    fileHash: hash.value,
    index,
    progress: 0,
  }));
  debugger;
  const { needUpload, uploadList } = await VerifyUpload(
    file.value.name,
    hash.value,
  );

  // if (needUpload) {
  //   await uploadParts({
  //     partList,
  //     filename,
  //     partsTotal: partList.length,
  //     uploadedPartsCount: 0,
  //   });
  // } else {
  //   ElMessage.success("秒传成功！");
  // }
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
    const cName = partList[i].chunkName
      ? (partList[i].chunkName as string)
      : `${filename}-${partList.indexOf(partList[i])}`;
    const params = {
      part: chunk,
      partName: cName,
      filename: filename,
    } as UploadPartControllerParams;

    const task = async () => {
      return await uploadPart(params);
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
  } else {
    await uploadParts({
      partList: partList.value,
      filename: filename,
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
