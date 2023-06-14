import axios, { AxiosInstance } from "axios";
import { GetBlockResult } from "casper-js-sdk";

import { SidecarDeploy } from "./types/api";

export class Sidecar {
  private api: AxiosInstance;

  constructor(
    public url: string,
    // TODO: will use sidecar endpoint when ready
    private readonly tempDevNet: AxiosInstance = axios.create({
      baseURL: "http://jakub.devnet.casperlabs.io:8888",
    })
  ) {
    this.api = axios.create({ baseURL: url });
  }

  async getIsSidecarRunning() {
    try {
      const { status } = await this.api.get("/block");

      if (status !== 200) {
        return false;
      }

      return true;
    } catch (e) {
      console.log("Error checking if sidecar is alive.", e);

      return false;
    }
  }

  async latestBlock() {
    const result = await this.api.get<GetBlockResult>("/block");

    return result;
  }

  async getBlockByHeight(blockHeight: number) {
    const result = await this.api.get<GetBlockResult>(`/block/${blockHeight}`);

    return result;
  }

  async getBlockByHash(blockHash: string) {
    const result = await this.api.get<GetBlockResult>(`/block/${blockHash}`);

    return result;
  }

  async getDeploy(hash: string) {
    const result = await this.api.get<SidecarDeploy>(`/deploy/${hash}`);

    return result;
  }

  async getDeploys(count = 10, pageNum = 1, sortBy?: string, orderBy = "desc") {
    // TODO: updated to released version of sidecar in #88
    const result = await this.tempDevNet.post<{ data: SidecarDeploy }>(
      "deploys",
      {
        exclude_expired: true,
        exclude_not_processed: false,
        offset: pageNum - 1,
        limit: count,
        sort_column: sortBy ?? "block_timestamp",
        sort_order: orderBy,
      }
    );

    return result;
  }
}
