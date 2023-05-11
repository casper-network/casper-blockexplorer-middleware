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

      try {
        const {
          status,
          data: { block: latestBlock },
        } = await this.sidecar.latestBlock();

        if (
          status !== 200 ||
          latestBlock === undefined ||
          latestBlock === null
        ) {
          this.isSidecarRunning = false;
          return this.getLatestBlock();
        }

        return latestBlock;
      } catch (e) {
        console.log("Error requesting latest block from sidecar.", e);

        this.isSidecarRunning = false;
        this.getLatestBlock();
      }
    }

    const { block: latestBlock } = await this.jsonRpc.getLatestBlockInfo();

    console.log("defaulted back to jsonRPC");

    return latestBlock;
  }
}
