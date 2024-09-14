import { ChainArtifact, getCAIPChain, getChainName } from '../resolver';
import { pluginConfig } from '../plugin';

const rateLimiters: {
  [chainId: string]: {
    [type: string]: RateLimiter;
  };
} = {};

export function getRateLimiter(chainArtifact: ChainArtifact, providerType: string = 'default'): RateLimiter {
  const chain = getCAIPChain(chainArtifact);
  const chainName = getChainName(chain);
  const chainStr = chain.toString();
  if (!(chainStr in rateLimiters)) {
    rateLimiters[chainStr] = {};
  }

  if (providerType in rateLimiters[chainStr]) {
    return rateLimiters[chainStr][providerType];
  }

  if (chain.namespace == 'eip155') {
    const rateLimit = pluginConfig['eip155']['networks'][chainName].providers[providerType]['settings'].rateLimit;
    rateLimiters[chainStr][providerType] = new RateLimiter(rateLimit);

    return rateLimiters[chainStr][providerType];
  } else {
    throw Error(`Network ${chain.toString()} is not yet supported`);
  }
}

/**
 * Rate limiters are initiated once per network. 
 */
export class RateLimiter {
  private rateLimit: number;
  private interval: number = 60000;
  private queue: Array<{ task: () => Promise<any>, resolve: (value: any) => void, reject: (reason?: any) => void }> = [];
  private isProcessing: boolean = false;
  private requestTimestamps: number[] = [];

  constructor(rateLimit: number) {
    this.rateLimit = rateLimit;
  }

  /**
   * 
   * @param task 
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
