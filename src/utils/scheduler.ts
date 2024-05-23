// 这个类写的不错，没大毛病，赞一个
class Scheduler {
  private queue: (() => Promise<void>)[] = []
  private maxCount: number
  private runCount = 0

  constructor(limit: number) {
    this.maxCount = limit
  }

// 这个 void 就不太对了，结果不一定是空的吧？
  add(promiseFn: () => Promise<void>) {
    this.queue.push(promiseFn)
    this.run()
  }

  private run() {
    if (this.runCount >= this.maxCount || this.queue.length == 0) {
      return;
    }
    this.runCount++;
    const task = this.queue.shift()!;
    task().finally(() => {
      this.runCount--;
      this.run();
    })
  }
}

export default Scheduler;