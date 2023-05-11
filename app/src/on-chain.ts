import { CasperServiceByJsonRPC } from "casper-js-sdk";
import { Sidecar } from "./sidecar";

export class OnChain {
  constructor(
    private jsonRpc: CasperServiceByJsonRPC,
    private sidecar: Sidecar,
    public isSidecarRunning: boolean = false
  ) {}

  async getLatestBlock() {
    if (this.isSidecarRunning) {
      // console.log("trying sidecar in OnChain");

      try {
        const {
          status,
          data: { block: latestBlock },
        } = await this.sidecar.latestBlock();

        // TODO: implement some kid of helper function for re routing to jsonRpc when this fails
        // to be used for all other methods in onChain
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

    console.log("defaulted back to jsonRPC for latest block");

    return latestBlock;
  }

  async getBlockByHeight(height: number) {
    if (this.isSidecarRunning) {
      try {
        const {
          status,
          data: { block },
        } = await this.sidecar.getBlockByHeight(height);

        // console.log("block in height", block);

        if (status !== 200 || block === undefined || block === null) {
          this.isSidecarRunning = false;
          return this.getBlockByHeight(height);
        }

        return block;
      } catch (e) {
        console.log("Error requesting block by height from sidecar.");

        this.isSidecarRunning = false;
        return this.getBlockByHeight(height);
      }
    }

    const { block } = await this.jsonRpc.getBlockInfoByHeight(height);

    console.log("defaulted back to jsonRPC for block by height");

    return block;
  }

  async getBlockByHash(hash: string) {
    if (this.isSidecarRunning) {
      try {
        const {
          status,
          data: { block },
        } = await this.sidecar.getBlockByHash(hash);

        // console.log("block in hash", block);

        if (status !== 200 || block === undefined || block === null) {
          this.isSidecarRunning = false;
          return this.getBlockByHash(hash);
        }

        return block;
      } catch (e) {
        console.log("Error requesting block by hash from sidecar.");

        this.isSidecarRunning = false;
        return this.getBlockByHash(hash);
      }
    }

    const { block } = await this.jsonRpc.getBlockInfo(hash);

    console.log("defaulted back to jsonRPC for block by hash");

    return block;
  }

  async getDeploy(hash: string) {
    if (this.isSidecarRunning) {
      // try {
      const {
        status,
        data: { deploy_accepted, deploy_processed },
      } = await this.sidecar.getDeploy(hash);

      const executionResults = [
        {
          block_hash: deploy_processed.block_hash,
          result: deploy_processed.execution_result,
        },
      ];

      // console.log("block in hash", block);

      if (
        status !== 200 ||
        deploy_accepted === undefined ||
        deploy_accepted === null
      ) {
        this.isSidecarRunning = false;
        return this.getDeploy(hash);
      }

      return { deploy: deploy_accepted, executionResults };
      // } catch (e) {
      //   console.log("Error requesting deploy by hash from sidecar.");

      //   this.isSidecarRunning = false;
      //   return this.getDeploy(hash);
      // }
    }

    const { deploy, execution_results: executionResults } =
      await this.jsonRpc.getDeployInfo(hash);

    console.log("defaulted back to jsonRPC for deploy by hash");

    return { deploy, executionResults };
  }
}
