import { CHUNK_SIZE } from "@/const";
import { Part, UploadPartControllerParams, UploadPartParams } from "@/types/file";
import Scheduler from "./scheduler";
import { mergeRequest, uploadPart } from "@/service/file";
import { ElMessage } from "element-plus";

/**
 * @description: 大文件切片
 * @param {any} 大文件 file 
 * @return {*} 返回切片列表
 */
export const splitChunks = (file: any): Part[] => {
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
};

/**
 * @description: 上传切片
 * @return {*}
 */
export const uploadParts = async ({
  fileArr,
  limit = 3,
}: UploadPartParams, controllersMap: Map<number, AbortController>) => {
  // 1.定义任务调度器
  const scheduler = new Scheduler(limit);
  // 2.遍历切片列表，将切片上传任务添加到任务调度
  for (let i = 0; i < fileArr.length; i++) {
    const partList = fileArr[i].partList!;
    for (let j = 0; j < partList.length; j++) {
      const { chunk } = partList[j];

      let pHash = partList[j].hash
        ? (partList[j].hash as string)
        : `${fileArr[i].fileHash}-${partList.indexOf(partList[j])}`;

      const params = {
        part: chunk,
        hash: pHash,
        fileHash: fileArr[i].fileHash,
        fileName: fileArr[i].name as string,
        size: fileArr[i].size,
      } as UploadPartControllerParams;

      const controller = new AbortController();
      controllersMap.set(j, controller);
      const { signal } = controller;

      const taskFn = async () => {
        return await uploadPart(params, onTick, i, j, signal);
      };
      scheduler.add(taskFn, j);
    }
  }
  // 3.执行任务
  const { status } = await scheduler.done();
  // 4.任务执行成功，合并切片
  if (status == "success") {
    for (let k = 0; k < fileArr.length; k++) {
      mergeRequest(fileArr[k].name, fileArr[k].fileHash!);
    }
    ElMessage.success("文件上传成功");
  } else {
    ElMessage.error("文件上传失败");
  }

  function onTick(index: number, pIndex: number, percent: number) {
    let partArr = fileArr[index].partList!;
    if (fileArr[index].fileHash == partArr[pIndex].fileHash) {
      partArr[pIndex].percentage = percent;
      const newPartsProgress = partArr.reduce(
        (sum, part) => sum + (part.percentage || 0),
        0,
      );
      const totalProgress =
        (newPartsProgress + pIndex * 100) / partArr.length;
      fileArr[index].uploadPercentage = Number(
        totalProgress.toFixed(2),
      );
    }
  }
}


