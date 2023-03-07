import { CasperServiceByJsonRPC } from "casper-js-sdk";
import { StatusCodes } from "http-status-codes";
import NodeCache from "node-cache";
import cron from "node-cron";

import {
  BLOCK_GENERATE_INTERVAL,
  DEFAULT_PAGINATION_COUNT,
  NODE_CACHE_LIMIT,
} from "../config";
import { Sort } from "../types";
import { Block } from "../types/on-chain";
import { ApiError } from "../utils";

export class BlocksService {
  private cache: NodeCache;
  constructor(private readonly rpcClient: CasperServiceByJsonRPC) {
    this.cache = new NodeCache({ checkperiod: 0 });
  }

  async init() {
    await this.getLatestBlock();

    // half of block interval time ensures we always have this in cache
    cron.schedule(`*/${BLOCK_GENERATE_INTERVAL / 2} * * * * *`, async () => {
      const overrideCache = true;
      await this.getLatestBlock(overrideCache);
    });
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

  async getLatestBlock(overrideCache?: boolean) {
    const cachedLatestBlock = this.cache.get<Block>("latest");

    if (cachedLatestBlock && !overrideCache) {
      return cachedLatestBlock;
    }

    const { block } = await this.rpcClient.getLatestBlockInfo();

    if (!block) throw new ApiError(StatusCodes.NOT_FOUND, "Not found block");

    this.cache.set("latest", block);
    this.cache.set(block.header.height, block);

    return block as unknown as Block;
  }

  async getBlockByHeight(height: number) {
    const exsitBlock = this.cache.get<Block>(height);

    if (exsitBlock) return exsitBlock;

    const { block } = await this.rpcClient.getBlockInfoByHeight(height);

    if (!block) throw new ApiError(StatusCodes.NOT_FOUND, "Not found block");

    this.checkFlushCache();
    this.cache.set(height, block);

    return block as unknown as Block;
  }

  async getBlock(blockHash: string) {
    const existBlock = this.cache.get<Block>(blockHash);

    if (existBlock) return existBlock;

    const { block } = await this.rpcClient.getBlockInfo(blockHash);

    if (!block) throw new ApiError(StatusCodes.NOT_FOUND, "Not found block");

    this.checkFlushCache();
    this.cache.set(blockHash, block);

    return block as unknown as Block;
  }

  checkFlushCache() {
    const cacheKeysLength = this.cache.keys().length;

    if (cacheKeysLength > NODE_CACHE_LIMIT) {
      this.cache.flushAll();
    }
  }
}
