/**
 * Rate limiters are initiated once per network. They're intended to limit heavy
 * requests like eth_getLog. 
 */
export class OiRateLimiter {
  private rateLimit: number;
  private interval: number = 60000;
  private queue: Array<{ task: () => Promise<any>, resolve: (value: any) => void, reject: (reason?: any) => void }> = [];
  private isProcessing: boolean = false;
  private requestTimestamps: number[] = [];

  constructor(rateLimit: number, interval: number = 60000) {
    this.rateLimit = rateLimit;
    this.interval = interval;
  }

  /**
   * Accepts a callback to queue and execute.
   * 
   * @param task Async callback.
   * @returns 
   */
  public execute<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Processing the queue.
   */
  private async processQueue() {
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const now = Date.now();

      // Filter out timestamps older than 1 second
      this.requestTimestamps = this.requestTimestamps.filter(
        timestamp => now - timestamp < this.interval
      );

      if (this.requestTimestamps.length < this.rateLimit) {
        // If under the rate limit, execute the task
        const { task, resolve, reject } = this.queue.shift()!;
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
        this.requestTimestamps.push(Date.now());
      }
      // Wait for the next available slot
      await new Promise(resolve => setTimeout(resolve, this.interval / this.rateLimit));
    }
    this.isProcessing = false;
  }
}
