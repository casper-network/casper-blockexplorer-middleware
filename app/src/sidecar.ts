import axios, { AxiosInstance } from "axios";
import { GetBlockResult } from "casper-js-sdk";
import { onChain } from "./main";

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
    try {
      const result = await this.api.get<GetBlockResult>("/block");

      // TODO: we could create a helper function to automatically check for this for every sidecar method
      // to always be checking to see if sidecar is running
      // and then call corresponding onChain method and set onChain.isSidecarRunning = false;
      // for now, we can just do if statements for POC
      if (result.status !== 200) {
        onChain.isSidecarRunning = false;
        onChain.getLatestBlock();

        return null;
      }

      return result.data;
    } catch (e) {
      console.log("ERROR!", e);

      onChain.isSidecarRunning = false;
      onChain.getLatestBlock();
    }
  }
}
