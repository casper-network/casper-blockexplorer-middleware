import axios, { AxiosInstance } from "axios";
import { GetBlockResult, JsonBlock } from "casper-js-sdk";
import { onChain } from "./main";

export class Sidecar {
  private api: AxiosInstance;

  constructor(public url: string) {
    this.api = axios.create({ baseURL: url });
  }

  public async latestBlock() {
    try {
      const result = await this.api.get<GetBlockResult>("/block");

      console.log({ result });

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
