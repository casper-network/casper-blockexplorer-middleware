import axios, { AxiosInstance } from "axios";
import { GetBlockResult, JsonBlock } from "casper-js-sdk";

export class Sidecar {
  private api: AxiosInstance;

  constructor(public url: string) {
    this.api = axios.create({ baseURL: url });
  }

  public async latestBlock() {
    try {
      const { data: block } = await this.api.get("/block");

      return block as unknown as GetBlockResult;
    } catch (e) {
      console.log("ERROR!", e);
    }
  }
}
