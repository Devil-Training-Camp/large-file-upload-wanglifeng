export interface Response<T> {
  code: number;
  data: T;
  message?: string;
}

// 校验文件是否已上传参数
export interface VerifyPartParams {
  // 文件名称
  fileName: string;
  // 文件 hash
  fileHash: string;
}

export type VerifyPartResponse = Response<{
  // 是否需要上传
  needUpload: boolean;
  // 已上传切片列表
  uploadedList: string[];
}>;

// 单个切片上传参数
export interface UploadPartControllerParams {
  // 切片
  part: Buffer;
  // 切片 hash 值
  hash: string
  // 文件 hash 值
  fileHash: string
  // 文件名
  fileName: string
  // 文件大小
  size: number
}

export type UploadPartControllerResponse = Response<{
  // 文件 hash 值
  fileHash: string
}>;

// 切片合并参数
export interface MergePartsControllerParams {
  // 文件 hash 值
  fileHash: string
  // 文件名
  fileName: string
  // 切片大小
  size?: number
}

export type MergePartsControllerResponse = Response<{
  // 文件 hash 值
  fileHash: string
}>;
