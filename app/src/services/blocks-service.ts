import { CasperServiceByJsonRPC } from "casper-js-sdk";
import { StatusCodes } from "http-status-codes";
import NodeCache from "node-cache";
import { BLOCK_GENERATE_INTERVAL, DEFAULT_PAGINATION_COUNT } from "../config";
import { Sort } from "../types";
import { Block } from "../types/on-chain";
import { ApiError } from "../utils";

// TODO: probably don't need to extend CacheService...
export class BlocksService {
  // TODO: maybe we could actually use a new Map() here??
  // Since we'll actually be managing the cache ourselves, instead of using stdTTL
  // We could probably use a Map to create the cache service?
  // But maybe not, since node-cache provides a simple cleanup

  // TODO: also need to think about managing the cache limit of 1M keys
  // -> since either way it'll just be a JS object under the hood
  // could consider making a duplicate cache if the original gets close to 1M

  // TODO: also should consider a cron service that actually just fetches the latest block on a timer
  // this way we won't actually have to ever fetch the latest block async
  // because once the cache fetches the latest block, it will just add to the cache
  // ON SERVER START - we would automatically fetch the latest block (everything above from that point on)

  private cache: NodeCache;
  constructor(private readonly rpcClient: CasperServiceByJsonRPC) {
    this.cache = new NodeCache({ checkperiod: 0 });
  }

  async getBlocks(
    count = DEFAULT_PAGINATION_COUNT,
    orderByHeight = "DESC" as Sort,
    pageNum = 1
  ) {
    const latestBlock = await this.getLatestBlock();
    const latestBlockHeight = latestBlock.header.height;

    const firstBlockOfPage = (pageNum - 1) * count;

    const fromBlock =
      orderByHeight === "DESC"
        ? latestBlockHeight - firstBlockOfPage
        : firstBlockOfPage;

    let targetBlock =
      orderByHeight === "DESC" ? fromBlock - count : fromBlock + count;

    if (targetBlock < 0) {
      targetBlock = 0;
    }

    if (targetBlock > latestBlockHeight) {
      targetBlock = latestBlockHeight;
    }

    const blockPromises: Promise<Block>[] = [];

    for (
      let i = fromBlock;
      orderByHeight === "DESC" ? i >= targetBlock : i < targetBlock;
      orderByHeight === "DESC" ? i-- : i++
    ) {
      try {
        const block = this.getBlockByHeight(i);
        if (blockPromises.length === count) {
          break;
        }
        blockPromises.push(block);
      } catch (error) {
        console.log("ERROR", error);
        break;
      }
    }

    const blocks = await Promise.all(blockPromises);

    const total = latestBlockHeight + 1;

    return { blocks, total, updated: latestBlock.header.timestamp };
  }

  async getLatestBlock() {
    // TODO:
    /*
      - don't use latestBlock cache
      - instead, check for largest height block from cache.keys()
      - then access value and see if it's been 33s since (+ time padding like in FE?)
      - if yes, then fetch latest block by using largest height + amount of time since block / 33s
      -> or actually maybe could just use the rpcClient.getLatestBlockInfo()
      - if no, simply just return the latest block from cache
    */

    const existLatestBlock = this.cache.get<Block>(`latestBlock`);

    console.log({ existLatestBlock });

    // console.log("cache", this.cache.keys());

    if (existLatestBlock) return existLatestBlock;

    const { block } = await this.rpcClient.getLatestBlockInfo();
    if (!block) throw new ApiError(StatusCodes.NOT_FOUND, "Not found block");

    const blockTimestamp = new Date(block.header.timestamp);

    const cacheTimeInSeconds =
      BLOCK_GENERATE_INTERVAL - (Date.now() - blockTimestamp.getTime()) / 1000;

    // TODO: this needs to be removed - it rarely works (see above)
    if (cacheTimeInSeconds > 0) {
      this.cache.set(`latestBlock`, block, cacheTimeInSeconds);
    }

    return block as unknown as Block;
  }

  async getBlockByHeight(height: number) {
    const exsitBlock = this.cache.get<Block>(`block:${height}`);

    if (exsitBlock) return exsitBlock;

    const { block } = await this.rpcClient.getBlockInfoByHeight(height);

    if (!block) throw new ApiError(StatusCodes.NOT_FOUND, "Not found block");

    this.cache.set(`block:${height}`, block);

    return block as unknown as Block;
  }

  async getBlock(blockHash: string) {
    const existBlock = this.cache.get<Block>(`block:${blockHash}`);
    if (existBlock) return existBlock;

    const { block } = await this.rpcClient.getBlockInfo(blockHash);
    if (!block) throw new ApiError(StatusCodes.NOT_FOUND, "Not found block");

    this.cache.set(`block:${blockHash}`, block);

    return block as unknown as Block;
  }
}
