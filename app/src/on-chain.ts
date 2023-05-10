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
      // use `sidecar.getLatestBlock`
      console.log("trying sidecar in OnChain");

      const { block: latestBlock } = await this.sidecar.latestBlock();

      if (latestBlock === undefined || latestBlock === null) {
        console.log("no result");
        return;
      }

      // TODO: if at any point this (or any sidecar method) returns null, undefined, error, etc.
      // then we want to set this.isSidecarRunning = false + automatically fetch using jsonRpc
      return latestBlock;
    }

    const { block: latestBlock } = await this.jsonRpc.getLatestBlockInfo();

    console.log("defaulted back to jsonRPC");

    return latestBlock;
  }
}
