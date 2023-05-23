import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Cache } from "cache-manager";
import { StatusCodes } from "http-status-codes";
import { BLOCK_GENERATE_INTERVAL, NODE_CACHE_LIMIT } from "src/config";
import { GatewayService } from "src/gateway/gateway.service";
import { onChain } from "src/main";
import { Block } from "src/types/api";
import { ApiError } from "src/utils/ApiError";

@Injectable()
export class BlocksService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(GatewayService) private readonly gateway: GatewayService
  ) {}

  async onModuleInit() {
    await this.getLatestBlock();
  }

  @Cron(`*/${BLOCK_GENERATE_INTERVAL / 2} * * * * *`, {
    name: "latestBlockSchedule",
  })
  async handleCron() {
    const overrideCache = true;
    await this.getLatestBlock(overrideCache);
  }

  // TODO: just testing for now. Will update in #74
  @Cron(`*/10 * * * * *`, { name: "gatewaySchedule" })
  async handleGatewayCron() {
    console.log("gateway cron has run...", new Date().getTime());

    this.gateway.handleEvent("gateway_schedule", {
      test: "gateway schedule test",
    });
  }

  public async emitFromBlocksService(data: any) {
    console.log("emitting from blocks service", data);
  }

  public async getLatestBlock(overrideCache?: boolean) {
    const cachedLatestBlock = await this.cacheManager.get<Block>("latest");

    if (cachedLatestBlock && !overrideCache) {
      return cachedLatestBlock;
    }

    const block = await onChain.getLatestBlock();

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

    const block = await onChain.getBlockByHeight(height);

    if (!block)
      throw new ApiError(StatusCodes.NOT_FOUND, "Block by height not found.");

    await this.checkFlushCache();
    await this.cacheManager.set(height.toLocaleString(), block);

    return block as unknown as Block;
  }

  async getBlock(blockHash: string) {
    const block = await onChain.getBlockByHash(blockHash);

    if (!block)
      throw new ApiError(StatusCodes.NOT_FOUND, "Block by hash not found.");

    this.checkFlushCache();

    return block as unknown as Block;
  }

  async getBlocks(count = 10, orderByHeight = "desc", pageNum = 1) {
    const latestBlock = await this.getLatestBlock();

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
