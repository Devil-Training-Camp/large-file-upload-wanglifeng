import { taskType } from "@/types/schedulerType";
import { FAIL, PENDING, STATUS, SUCCESS } from "./../const/index";


/**
 * @description: 控制切片上传并发请求
 * @return {*}
 */
class Scheduler {
  private queue: taskType[] = []; // 任务数组
  private settledCount: number = 0; // 已经有结果的任务数量
  private maxCount: number; // 最大并发量
  private retryTime: number; // 重试次数
  private status: string;

  constructor(limit: number, retryTime: number = 3) {
    this.maxCount = limit;
    this.retryTime = retryTime;
    this.status = PENDING;
  }
  // 添加任务
  add(
    handler: () => Promise<{
      fileHash: string;
    }>,
    index: number,
  ) {
    this.queue.push({ handler, status: STATUS.waiting, retryTime: 0, index });
  }
  // 执行任务
  run() {
    return new Promise<string>((resolve) => {
      const start = async () => {
        const index = this.queue.findIndex(
          ({ status }) => status === STATUS.waiting || status === STATUS.error,
        );
        if (index == -1) return;
        const task = this.queue[index];
        task.status = STATUS.running;
        const pFn = task.handler();
        pFn
          .then(() => {
            task.status = STATUS.success;
            this.settledCount += 1;
            if (this.settledCount >= this.queue.length) {
              if (this.status === PENDING) {
                this.status = SUCCESS;
              }
              resolve("success");
            } else {
              start();
            }
          })
          .catch(() => {
            if (task.retryTime >= this.retryTime) {
              task.status = STATUS.fail;
              this.settledCount += 1;
              this.status = FAIL;
            } else {
              task.status = STATUS.error;
              task.retryTime++;
            }
            if (this.settledCount >= this.queue.length) {
              resolve("fail");
            } else {
              start();
            }
          });
      };
      for (let i = 0; i < this.maxCount; i++) {
        start();
      }
    });
  }
  done() {
    // 这个改动也很合理，改了一个 bug 了
    return this.run().then((res) => ({
      status: this.status,
      res,
    }))
  }
}

export default Scheduler;