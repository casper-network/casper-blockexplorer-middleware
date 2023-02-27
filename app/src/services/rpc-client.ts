import {
  Bid,
  CasperServiceByJsonRPC,
  CLPublicKey,
  GetStatusResult,
} from "casper-js-sdk";
import { StatusCodes } from "http-status-codes";
import NodeCache from "node-cache";

import { BLOCK_GENERATE_INTERVAL, DEFAULT_PAGINATION_COUNT } from "../config";
import { Sort } from "../types";
import { Block, ValidatorsProcessedWithStatus } from "../types/on-chain";
import { ApiError, isValidPublicKey } from "../utils";
import { paginateValidators, processValidatorsInfoResult } from "./utils";

export interface ActualBid extends Bid {
  inactive: boolean;
}
export class RpcClient {
  private cache: NodeCache;
  constructor(private readonly rpcClient: CasperServiceByJsonRPC) {
    this.cache = new NodeCache();
  }

  async getStatus() {
    const existStatus = this.cache.get<GetStatusResult>("status");
    if (existStatus) return existStatus;

    const status = await this.rpcClient.getStatus();

    this.cache.set("status", status);

    return status;
  }

  async getLatestBlock() {
    const existLatestBlock = this.cache.get<Block>(`latestBlock`);
    if (existLatestBlock) return existLatestBlock;

    const { block } = await this.rpcClient.getLatestBlockInfo();
    if (!block) throw new ApiError(StatusCodes.NOT_FOUND, "Not found block");

    const blockTimestamp = new Date(block.header.timestamp);

    const cacheTimeInSeconds =
      BLOCK_GENERATE_INTERVAL - (Date.now() - blockTimestamp.getTime()) / 1000;

    if (cacheTimeInSeconds > 0)
      this.cache.set(`latestBlock`, block, cacheTimeInSeconds);

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

  async getBlockByHeight(height: number) {
    const exsitBlock = this.cache.get<Block>(`block:${height}`);
    if (exsitBlock) return exsitBlock;

    const { block } = await this.rpcClient.getBlockInfoByHeight(height);

    if (!block) throw new ApiError(StatusCodes.NOT_FOUND, "Not found block");

    this.cache.set(`block:${height}`, block);

    return block as unknown as Block;
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

  async getDeploy(deployHash: string) {
    const { deploy, execution_results } = await this.rpcClient.getDeployInfo(
      deployHash
    );

    return { ...deploy, execution_results };
  }

  getAccount = async (accountHashOrPublicKey: string) => {
    const stateRootHash = await this.rpcClient.getStateRootHash();
    const accountHash = isValidPublicKey(accountHashOrPublicKey)
      ? CLPublicKey.fromHex(accountHashOrPublicKey).toAccountHashStr()
      : `account-hash-${accountHashOrPublicKey}`;

    const { Account: account } = await this.rpcClient.getBlockState(
      stateRootHash,
      accountHash,
      []
    );

    if (!account)
      throw new ApiError(StatusCodes.NOT_FOUND, "Not found account");
    return account;
  };

  async getCurrentEraValidators(count?: number, pageNum?: number) {
    const cachedValidatorsInfo = this.cache.get<ValidatorsProcessedWithStatus>(
      "processedValidatorsWithStatus"
    );

    const {
      header: { era_id: latestEraId },
    } = await this.getLatestBlock();

    if (
      cachedValidatorsInfo &&
      latestEraId === cachedValidatorsInfo.status.latestEraId
    ) {
      return paginateValidators(cachedValidatorsInfo, count, pageNum);
    }

    const validatorsInfo = await this.rpcClient.getValidatorsInfo();

    const processedValidatorsWithStatus = processValidatorsInfoResult(
      validatorsInfo,
      latestEraId
    );

    this.cache.set(
      "processedValidatorsWithStatus",
      processedValidatorsWithStatus
    );

    return paginateValidators(processedValidatorsWithStatus, count, pageNum);
  }

  async getCurrentEraValidatorStatus() {
    let currentValidatorsInfo: ValidatorsProcessedWithStatus;

    const cachedValidatorsInfo = this.cache.get<ValidatorsProcessedWithStatus>(
      "processedValidatorsWithStatus"
    );

    const {
      header: { era_id: latestEraId },
    } = await this.getLatestBlock();

    if (
      cachedValidatorsInfo &&
      latestEraId === cachedValidatorsInfo.status.latestEraId
    ) {
      currentValidatorsInfo = cachedValidatorsInfo;
    } else {
      currentValidatorsInfo = await this.getCurrentEraValidators();
    }

    return {
      validatorsCount: currentValidatorsInfo.status.validatorsCount,
      bidsCount: currentValidatorsInfo.status.bidsCount,
    };
  }
}
