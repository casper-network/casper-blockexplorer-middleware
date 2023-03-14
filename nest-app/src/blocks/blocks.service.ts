import {
  CacheTTL,
  CACHE_MANAGER,
  Inject,
  Injectable,
  OnModuleInit,
} from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Cache } from "cache-manager";
import { CasperServiceByJsonRPC } from "casper-js-sdk";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "src/utils/ApiError";

// Using our stable node
export const jsonRpc = new CasperServiceByJsonRPC(
  `https://rpc.mainnet.casperlabs.io/rpc`
);

export interface Block {
  hash: string;
  header: Header;
  body: Body;
  proofs: Proof[];
}

export interface Proof {
  public_key: string;
  signature: string;
}

export interface Body {
  proposer: string;
  deploy_hashes: string[];
  transfer_hashes: string[];
}

export interface Header {
  parent_hash: string;
  state_root_hash: string;
  body_hash: string;
  random_bit: boolean;
  accumulated_seed: string;
  era_end: null;
  timestamp: string;
  era_id: number;
  height: number;
  protocol_version: string;
}
const NODE_CACHE_LIMIT = 2 ** 19;

// @Injectable()
export class BlocksService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async onModuleInit() {
    console.log("in onModuleInit");

    await this.getLatestBlock();
  }

  @Cron(`*/${30 / 2} * * * * *`)
  async handleCron() {
    console.log("cron service running", new Date().getTime());

    const overrideCache = true;
    await this.getLatestBlock(overrideCache);
  }

  async getLatestBlock(overrideCache?: boolean) {
    const cachedLatestBlock = await this.cacheManager.get<Block>("latest");

    if (cachedLatestBlock && !overrideCache) {
      return cachedLatestBlock;
    }

    const { block } = await jsonRpc.getLatestBlockInfo();

    if (!block) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Latest block not found.");
    }

    await this.cacheManager.set("latest", block);
    await this.cacheManager.set(block.header.height.toLocaleString(), block);

    return block;
  }

  async getBlockByHeight(height: number) {
    const cachedBlock = await this.cacheManager.get<Block>(
      height.toLocaleString()
    );

    if (cachedBlock) return cachedBlock;

    const { block } = await jsonRpc.getBlockInfoByHeight(height);

    if (!block)
      throw new ApiError(StatusCodes.NOT_FOUND, "Block by height not found");

    await this.checkFlushCache();
    await this.cacheManager.set(height.toLocaleString(), block);

    return block as unknown as Block;
  }

  // TODO: add sorting logic
  async getBlocks(count = 10, orderByHeight = "desc", pageNum = 1) {
    const latestBlock = await this.getLatestBlock();

    console.log({ latestBlock });

    const latestBlockHeight = latestBlock.header.height;

    const firstBlockOfPage = (pageNum - 1) * count;

    const fromBlock =
      orderByHeight === "desc"
        ? latestBlockHeight - firstBlockOfPage
        : firstBlockOfPage;

    let targetBlock =
      orderByHeight === "desc" ? fromBlock - count : fromBlock + count;

    if (targetBlock < 0) {
      targetBlock = 0;
    }

    if (targetBlock > latestBlockHeight) {
      targetBlock = latestBlockHeight;
    }

    const blockPromises: Promise<Block>[] = [];

    for (
      let i = fromBlock;
      orderByHeight === "desc" ? i >= targetBlock : i < targetBlock;
      orderByHeight === "desc" ? i-- : i++
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

  async checkFlushCache() {
    const cacheKeysLength = (await this.cacheManager.store.keys()).length;

    if (cacheKeysLength > NODE_CACHE_LIMIT) {
      this.cacheManager.reset();
    }
  }
}