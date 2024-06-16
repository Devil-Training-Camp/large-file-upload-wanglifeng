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
            <el-button @click="handlePause" v-if="upload"
              ><el-icon><VideoPause /></el-icon>暂停</el-button
            >
            <el-button @click="handlePause" v-if="!upload"
              ><el-icon><VideoPlay /></el-icon>恢复</el-button
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
import { inject, onMounted, ref } from "vue";
import { CHUNK_SIZE, HASH_KEY, STORE_NAME } from "@/const";
import { ElMessage, ElUpload } from "element-plus";
import FileItem from "@/components/FileItem.vue";
import {
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
const partList = ref<Part[]>([]);
const upload = ref<boolean>(true);
const hash = ref<string>("");
const controllersMap = new Map<number, AbortController>();
let uploadedLen: number = 0; // 已上传切片数量
let chunksLen: number = 0; // 总切片数量

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

  // 1.生成文件切片
  const filePartList: Part[] = splitChunks(file.value);
  // 2.计算 hash 值
  hash.value = await calculateHash(filePartList);
  let fileName: string = file.value.name,
    fileHash: string = hash.value;
  // 3.校验文件是否需要上传
  const { needUpload, uploadedList } = await verify({ fileName, fileHash });
  uploadedLen = uploadedList.length;
  // 如果上传过，不需要上传，秒传
  if (!needUpload) {
    ElMessage.success("秒传：上传成功");
    return;
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
    partList: partList.value,
    hash: hash.value,
  });
};

/**
 * @description: 上传切片
 * @param {*} partList 切片列表
 * @param {*} hash 文件 hash值
 * @param {*} limit 最大请求数
 * @return {*}
 */
async function uploadParts({ partList, hash, limit = 3 }: UploadPartParams) {
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
      fileName: file.value?.name as string,
      size: file.value?.size,
    } as UploadPartControllerParams;

    const taskFn = async () => {
      return await uploadPart(params);
    };
    scheduler.add(taskFn, i);
  }
  // 3.执行任务
  const { status } = await scheduler.done();
  // 4.任务执行成功，合并切片
  if (status == "success") {
    mergeRequest();
  } else {
    ElMessage.error("文件上传失败");
  }
}

/**
 * @description: 切片合并请求
 * @return {*}
 */
async function mergeRequest() {
  await mergePart({
    fileName: file.value!.name as string,
    size: CHUNK_SIZE,
    fileHash: hash.value,
  });
  file.value = null;
}

/**
 * @description: 暂停/恢复上传
 * @return {*}
 */
async function handlePause() {
  upload.value = !upload.value;
  if (upload.value) {
    // 检查是否有上传文件
    if (!file.value?.name) {
      return;
    }

    // 校验文件是否上传过
    const { needUpload, uploadedList } = await verify({
      fileName: file.value.name,
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
        partList: newParts,
        hash: hash.value,
      });
    }
  } else {
    // 暂停上传
    abortAll();
  }
}

/**
 * @description: 上传进度监听函数
 * @param {*} item
 * @return {*}
 */
function onProgress(item: Part) {
  return (e) => {
    item.percentage = parseInt(String((e.loaded / e.total) * 100));
  };
}

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
@/types/file
