import { Part } from "@/types";
import Worker from "../utils/hash_worker.ts?worker";

/**
 * @description: 计算文件 hash
 * @param {Part} 切片列表 partList
 * @return {*} 返回文件 hash
 */
export const calculateHash = (partList: Part[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    let worker = new Worker();
    worker.postMessage({ partList });
    worker.onmessage = (event) => {
      const { hash } = event.data;
      if (hash) {
        resolve(hash);
      }
    };
    worker.onerror = (event) => {
      worker.terminate();
      reject(event.error);
    };
  });
};
