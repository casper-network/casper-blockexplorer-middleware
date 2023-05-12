import axios, { AxiosInstance } from "axios";
import { GetBlockResult } from "casper-js-sdk";

export class Sidecar {
  private api: AxiosInstance;

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

    // console.log("block by height result", result);

    return result;
  }

  async getBlockByHash(blockHash: string) {
    const result = await this.api.get<GetBlockResult>(`/block/${blockHash}`);

    // console.log("block by hash result", result);

    return result;
  }

  async getDeploy(hash: string) {
    // TODO: need to type this return
    const result = await this.api.get(`/deploy/${hash}`);

    // console.log("deploy results", result.data);
    // console.log("exec results", result.data.deploy_processed.execution_result);

    return result;
  }
}
