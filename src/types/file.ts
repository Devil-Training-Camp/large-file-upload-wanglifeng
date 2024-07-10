import { HASH_KEY } from "@/const";

// 上传文件参数
export interface FileData {
  // 文件内容
  file?: File;
  // 文件名称
  name: string;
  // 文件大小
  size: number;
  // 文件 hash
  fileHash?: string;
  // 切片列表
  partList?: Part[],
  // 上传进度
  uploadPercentage: number;
}

// 切片数据
export interface Part {
  // 文件hash
  fileHash?:string;
  // 切片大小
  size: number;
  // 切片
  chunk: Blob;
  // 切片hash
  [HASH_KEY]: string;
  // 切片索引
  index?:number;
  // 上传进度
  percentage?: number;
}

export interface UploadPartParams {
  // 上传文件列表
  fileArr: FileData[];
  // 请求数量限制
  limit?: number;
}

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
  uploadedList: string[];
}>;

// 切片合并参数
export interface MergePartsControllerParams {
  // 文件 hash 值
  fileHash: string;
  // 文件名
  fileName: string;
  // 切片大小
  size?: number;
}

export type MergePartsControllerResponse = Response<{
  // 文件 hash 值
  fileHash: string;
}>;

// 单个切片上传参数
export interface UploadPartControllerParams {
  // 切片
  part: Blob;
  // 切片 hash 值
  hash: string;
  // 文件 hash 值
  fileHash: string;
  // 文件名
  fileName: string;
  // 文件大小
  size: number;
}

export type UploadPartControllerResponse = Response<{
  // 文件 hash 值
  fileHash: string;
}>;
