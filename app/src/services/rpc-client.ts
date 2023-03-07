import {
  Bid,
  CasperServiceByJsonRPC,
  CLPublicKey,
  GetStatusResult,
} from "casper-js-sdk";
import { StatusCodes } from "http-status-codes";
import NodeCache from "node-cache";

import { Sort } from "../types";
import {
  ValidatorProcessed,
  ValidatorsProcessedWithStatus,
} from "../types/on-chain";
import { ApiError, isValidPublicKey } from "../utils";
import { BlocksService } from "./blocks-service";
import {
  paginateValidators,
  processValidatorsInfoResult,
  sortValidators,
} from "./utils";

export interface ActualBid extends Bid {
  inactive: boolean;
}
export class RpcClient {
  private cache: NodeCache;
  constructor(
    private readonly rpcClient: CasperServiceByJsonRPC,
    private readonly blocksService: BlocksService
  ) {
    this.cache = new NodeCache();
    this.blocksService = blocksService;
  }

  async getStatus() {
    const existStatus = this.cache.get<GetStatusResult>("status");
    if (existStatus) return existStatus;

    const status = await this.rpcClient.getStatus();

    this.cache.set("status", status);

    return status;
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

  async getCurrentEraValidators(
    count?: number,
    pageNum?: number,
    sortBy?: keyof ValidatorProcessed,
    orderBy?: Sort
  ) {
    const cachedValidatorsInfo = this.cache.get<ValidatorsProcessedWithStatus>(
      "processedValidatorsWithStatus"
    );

    const {
      header: { era_id: latestEraId },
    } = await this.blocksService.getLatestBlock();

    if (
      cachedValidatorsInfo &&
      latestEraId === cachedValidatorsInfo.status.latestEraId
    ) {
      const sortedValidatorsInfo = sortValidators(
        cachedValidatorsInfo,
        sortBy,
        orderBy
      );

      return paginateValidators(sortedValidatorsInfo, count, pageNum);
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

    const sortedValidatorsInfo = sortValidators(
      processedValidatorsWithStatus,
      sortBy,
      orderBy
    );

    return paginateValidators(sortedValidatorsInfo, count, pageNum);
  }

  async getCurrentEraValidatorStatus() {
    let currentValidatorsInfo: ValidatorsProcessedWithStatus;

    const cachedValidatorsInfo = this.cache.get<ValidatorsProcessedWithStatus>(
      "processedValidatorsWithStatus"
    );

    const {
      header: { era_id: latestEraId },
    } = await this.blocksService.getLatestBlock();

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
