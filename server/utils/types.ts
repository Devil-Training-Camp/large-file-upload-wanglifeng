export interface Response<T> {
  code: number;
  data: T;
  message?: string;
}

// 校验文件是否已上传参数
export interface VerifyPartParams {
  filename: string;
}

export type VerifyPartResponse = Response<{
  // 是否需要上传
  needUpload: boolean;
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

// 切片合并参数
export interface MergePartsControllerParams {
  // 文件名
  filename?: string;
}

export type MergePartsControllerResponse = Response<{
  filename: string;
}>;
