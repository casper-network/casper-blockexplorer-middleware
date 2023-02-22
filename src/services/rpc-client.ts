import {
  Bid,
  CasperServiceByJsonRPC,
  CLPublicKey,
  GetStatusResult,
  ValidatorBid,
  ValidatorsInfoResult,
  ValidatorWeight,
} from "casper-js-sdk";
import { StatusCodes } from "http-status-codes";
import NodeCache from "node-cache";

interface ActualBid extends Bid {
  inactive: boolean;
}

import { BLOCK_GENERATE_INTERVAL, DEFAULT_PAGINATION_COUNT } from "../config";
import { Sort } from "../types";
import { Block } from "../types/on-chain";
import { ApiError, isValidPublicKey } from "../utils";

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

  async getCurrentEraValidators() {
    const cachedValidatorsInfo = this.cache.get<{
      activeValidators: ValidatorWeight[];
      activeBids: ValidatorBid[];
    }>("validatorsInfo");

    if (cachedValidatorsInfo) return cachedValidatorsInfo;

    const validatorsInfo = await this.rpcClient.getValidatorsInfo();

    const {
      header: { era_id: latestEraId },
    } = await this.getLatestBlock();

    const activeValidators =
      validatorsInfo.auction_state.era_validators.find(
        ({ era_id }) => era_id === latestEraId
      )?.validator_weights ?? [];

    const activeBids = validatorsInfo.auction_state.bids.filter(
      (validatorBid) => (validatorBid.bid as ActualBid).inactive === false
    );

    const currentValidatorsInfo = {
      activeValidators,
      activeBids,
    };

    this.cache.set("validatorsInfo", currentValidatorsInfo);

    return currentValidatorsInfo;
  }

  async getCurrentEraValidatorStatus() {
    let currentValidatorsInfo: {
      activeValidators: ValidatorWeight[];
      activeBids: ValidatorBid[];
    };

    const cachedValidatorsInfo = this.cache.get<{
      activeValidators: ValidatorWeight[];
      activeBids: ValidatorBid[];
    }>("validatorsInfo");

    if (cachedValidatorsInfo) {
      currentValidatorsInfo = cachedValidatorsInfo;
    } else {
      currentValidatorsInfo = await this.getCurrentEraValidators();
    }

    return {
      validatorsCount: currentValidatorsInfo.activeValidators.length,
      bidsCount: currentValidatorsInfo.activeBids.length,
    };
  }
}
