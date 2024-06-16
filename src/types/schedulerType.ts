// 定义任务类型
export interface taskType {
  handler: () => Promise<{ fileHash: string }>;
  status: string;
  retryTime: number;
  index: number;
}
