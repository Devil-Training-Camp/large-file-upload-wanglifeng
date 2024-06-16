import { CHUNK_SIZE } from "@/const";
import { Part } from "@/types/file";

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
