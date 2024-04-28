// import SparkMd5 from "spark-md5";

// const readChunk = (file) => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsArrayBuffer(file);
//     let percent = 0,
//       perSize = 100 / partList.length;
//     // 开始读取文件时触发
//     reader.onload = (event) => {
//       percent += perSize;
//       self.postMessage({ percent: Number(percent).toFixed(2) });
//       resolve(event.target?.result);
//     };
//     // 读取进度事件
//     reader.onprogress = (event) => {
//       let percent = Math.round((event.loaded / event.total) * 100);
//       console.log(`正在读取文件${percent}%...`);
//     };
//     reader.onerror = (err) => {
//       reject(err);
//     };
//   });
// };
// // 使用 onmessage 方法获取主线程传过来的消息
// self.onmessage = async (event) => {
//   const { partList } = event.data;
//   const spark = new SparkMd5.ArrayBuffer();

//   buffers.forEach((buffer) => spark.append(buffer));
//   self.postMessage({ percent: 100, hash: spark.end() });
//   self.close();
// };
