export interface Response<T> {
  code: number;
  data: T;
  message?: string;
}

// 校验文件是否已上传参数
export interface VerifyPartParams {
  fileName: string;
  fileHash: string;
}

export type VerifyPartResponse = Response<{
  // 是否需要上传
  needUpload: boolean;
  // 已上传
  uploadList: string[];
}>;

// 切片合并参数
export interface MergePartsControllerParams {
  // 文件名
  filename?: string;
}

export type MergePartsControllerResponse = Response<{
  filename: string;
}>;

// 单个切片上传参数
export interface UploadPartControllerParams {
  // 切片
  part: Blob;
  // 切片名称
  partName: string;
  // 文件名称
  filename: string;
}

export type UploadPartControllerResponse = Response<{
  // 文件名
  filename: string;
}>;

// 切片类
export interface Part {
  // 切片大小
  size: number;
  // 切片
  chunk: Blob;
  // 切片hash
  hash?: string;
  // 上传进度
  percentage?: number;
}

export interface UploadPartParams {
  // 切片列表
  partList: Part[];
  // 文件hash
  hash: string;
  // 切片总数
  partsTotal: number;
  // 已经上传的切片数量
  uploadedPartsCount: number;
  // 请求数量限制
  limit?: number;
}

export interface UploadedFile {
  // 文件名
  name: string;
  // 文件已上传大小
  uploadedSize: number;
  // 文件总大小
  totalSize: number;
  // 操作时间
  time: string;
  // 文件 hash 值
  hash: string;
}
