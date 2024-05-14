export interface Response<T> {
  code: number;
  data: T;
  message?: string;
}

// 切片类
export interface Part {
  // 切片大小
  size: number;
  // 切片
  chunk: Blob;
  // 文件名称
  filename?: string;
  // 切片名称
  chunkName?: string;
  // 上传进度
  percent?: number;
}

// 校验文件是否已上传参数
export interface VerifyPartParams {
  filename: string;
}

export type VerifyPartResponse = Response<{
  // 是否需要上传
  needUpload: boolean;
}>;

export interface UploadPartParams {
  // 切片列表
  partList: Part[];
  // 文件hash
  filename: string;
  // 切片总数
  partsTotal: number;
  // 已经上传的切片数量
  uploadedPartsCount: number;
  // 请求数量限制
  limit?: number;
}

// 单个切片上传参数
export interface UploadPartControllerParams {
  // 切片
  part: Blob;
  // 切片名称
  partName: string;
  // 文件名称
  fileName: string;
}

export type UploadPartControllerResponse = Response<{
  // 文件名
  filename: string;
}>;

// 切片合并参数
export interface MergePartsControllerParams {
  // 文件名
  filename?: string;
}

export type MergePartsControllerResponse = Response<{
  filename: string;
}>
