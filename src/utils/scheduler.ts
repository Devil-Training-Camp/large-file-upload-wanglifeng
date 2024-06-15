class Scheduler {
  private queue: (() => Promise<void>)[] = [];
  private maxCount: number;
  private runCount = 0;

  constructor(limit: number) {
    this.maxCount = limit;
  }

  add(promiseFn: () => Promise<void>) {
    this.queue.push(promiseFn);
    this.run();
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
    });
  }
}

export default Scheduler;
