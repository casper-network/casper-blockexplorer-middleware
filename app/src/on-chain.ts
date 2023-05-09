import { CasperServiceByJsonRPC } from "casper-js-sdk";
import { Sidecar } from "./sidecar";

export class OnChain {
  constructor(
    private jsonRpc: CasperServiceByJsonRPC,
    private sidecar: Sidecar,
    public isSidecarRunning: boolean = false
  ) {}

  async testGetLatestBlock() {
    // TODO: need to verify that the response type is the same
    // or modify ReturnType based on if isSidecarRunning
    if (this.isSidecarRunning) {
      // use `sidecar.getLatestBlock`

      const { block: latestBlock } = await this.sidecar.latestBlock();
      return latestBlock;
    }

    const { block: latestBlock } = await this.jsonRpc.getLatestBlockInfo();
    return latestBlock;
  }
}
