// 切片类
export interface Part {
  //   切片大小
  size: number;
  // 切片
  chunk: Blob;
  //   文件名称
  filename?: string;
  //   切片名称
  chunkName?: string;
  // 上传进度
  percent?:number;
}
