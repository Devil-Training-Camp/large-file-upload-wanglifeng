import { Part } from "@/types";
import Worker from "../utils/hash_worker.ts?worker";

// 计算文件hash
export const calculateHash = (partList: Part[]): Promise<string> => {
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
