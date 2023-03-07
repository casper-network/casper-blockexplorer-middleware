import {
  Bid,
  CasperServiceByJsonRPC,
  CLPublicKey,
  GetStatusResult,
} from "casper-js-sdk";
import { StatusCodes } from "http-status-codes";
import NodeCache from "node-cache";

import { ApiError, isValidPublicKey } from "../utils";
import { BlocksService } from "./blocks-service";

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
}
