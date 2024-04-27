import SparkMd5 from "spark-md5";

// 使用 onmessage 方法获取主线程传过来的消息
self.onmessage = async (event) => {
  const { partList } = event.data;
  const spark = new SparkMd5.ArrayBuffer();
  const reader = new FileReader();
  let percent = 0,
    perSize = 100 / partList.length;
  let buffers = await Promise.all(
    partList.map(
      ({ chunk }) =>
        new Promise((resolve, reject) => {
          reader.readAsArrayBuffer(chunk);
          // 开始读取文件时触发
          reader.onload = (event) => {
            percent += perSize;
            self.postMessage({ percent: Number(percent).toFixed(2) });
            resolve(event.target?.result);
          };
          // 读取进度事件
          reader.onprogress = (event) => {
            let percent = Math.round((event.loaded / event.total) * 100);
            console.log(`正在读取文件${percent}%...`);
          };
          reader.onerror = (event) => {
            reject("文件读取错误");
          };
        }),
    ),
  );
  buffers.forEach((buffer) => spark.append(buffer));
  self.postMessage({ percent: 100, hash: spark.end() });
  self.close();
};
