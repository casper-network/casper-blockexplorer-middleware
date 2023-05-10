import { CasperServiceByJsonRPC } from "casper-js-sdk";
import { Sidecar } from "./sidecar";

export class OnChain {
  constructor(
    private jsonRpc: CasperServiceByJsonRPC,
    private sidecar: Sidecar,
    public isSidecarRunning: boolean = false
  ) {}

  async getLatestBlock() {
    // TODO: need to verify that the response type is the same
    // or modify ReturnType based on if isSidecarRunning
    if (this.isSidecarRunning) {
      console.log("trying sidecar in OnChain");

      const { block: latestBlock } = await this.sidecar.latestBlock();

      if (latestBlock === undefined || latestBlock === null) {
        return;
      }

      return latestBlock;
    }

    const { block: latestBlock } = await this.jsonRpc.getLatestBlockInfo();

    console.log("defaulted back to jsonRPC");

    return latestBlock;
  }
}
