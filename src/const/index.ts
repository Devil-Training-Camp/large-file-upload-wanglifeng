// 定义单个切片大小
export const CHUNK_SIZE = 5 * 1024 * 1024;

// promise状态
export const PENDING = "pending";
export const SUCCESS = "success";
export const FAIL = "fail";

// 上传切片任务状态
export const STATUS = {
  waiting: "waiting", // 等待
  running: "running", // 进行中
  error: "error", // 错误，但可以重试
  success: "success", // 成功
  fail: "fail", // 超过重试次数后仍然失败
};

export const STORE_NAME = "fileSliceStore";

export const HASH_KEY = "hashKey";
