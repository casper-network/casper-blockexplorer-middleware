import { Logger } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import { GetBlockResult } from "casper-js-sdk";

import { SidecarDeploy } from "./types/api";

export class Sidecar {
  private api: AxiosInstance;
  readonly logger = new Logger(Sidecar.name);

  constructor(public url: string) {
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
      this.logger.error("Error checking if sidecar is alive.", e);

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
}
