import { Part } from "@/types/file";
import SparkMd5 from "spark-md5";

const readChunk = (file: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    // 开始读取文件时触发
    reader.onload = (event) => {
      resolve(event.target?.result);
    };

    // 读取进度事件
    reader.onprogress = (event) => {
      let percent = Math.round((event.loaded / event.total) * 100);
      console.log(`正在读取文件${percent}%...`);
    };

    // 出错事件
    reader.onerror = (err) => {
      reject(err);
    };
  });
};

// 使用 onmessage 方法获取主线程传过来的消息
self.onmessage = async (event) => {
  const { partList } = event.data as { partList: Part[] };
  const spark = new SparkMd5.ArrayBuffer();
  for (let i = 0; i < partList.length; i++) {
    const chunk = partList[i].chunk;
    const res = await readChunk(chunk);
    spark.append(res);

    self.postMessage({
      percentage: ((i + 1) / partList.length) * 100,
    });
  }
  self.postMessage({ percent: 100, hash: spark.end() });
  self.close();
};
