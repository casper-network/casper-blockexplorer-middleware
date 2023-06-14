import { CasperServiceByJsonRPC, JsonBlock } from "casper-js-sdk";

import { Sidecar } from "./sidecar";

export class OnChain {
  constructor(
    private jsonRpc: CasperServiceByJsonRPC,
    private sidecar: Sidecar,
    public isSidecarRunning: boolean = false
  ) {}

  async checkSidecarStatus<TEntity extends object>(
    status: number,
    entity: TEntity | undefined | null,
    onChainMethod: () => void
  ) {
    if (status !== 200 || entity === undefined || entity === null) {
      this.isSidecarRunning = false;
      return onChainMethod();
    }
  }

  async getLatestBlock() {
    if (this.isSidecarRunning) {
      try {
        const {
          status,
          data: { block: latestBlock },
        } = await this.sidecar.latestBlock();

        this.checkSidecarStatus<JsonBlock>(status, latestBlock, () =>
          this.getLatestBlock()
        );

        return latestBlock;
      } catch (e) {
        console.log("Error requesting latest block from sidecar.", e);

        this.isSidecarRunning = false;
        return this.getLatestBlock();
      }
    }

    const { block: latestBlock } = await this.jsonRpc.getLatestBlockInfo();

    return latestBlock;
  }

  async getBlockByHeight(height: number) {
    if (this.isSidecarRunning) {
      try {
        const {
          status,
          data: { block },
        } = await this.sidecar.getBlockByHeight(height);

        this.checkSidecarStatus<JsonBlock>(status, block, () =>
          this.getBlockByHeight(height)
        );

        return block;
      } catch (e) {
        console.log("Error requesting block by height from sidecar.");

        this.isSidecarRunning = false;
        return this.getBlockByHeight(height);
      }
    }
    const { block } = await this.jsonRpc.getBlockInfoByHeight(height);

    return block;
  }

  async getBlockByHash(hash: string) {
    if (this.isSidecarRunning) {
      try {
        const {
          status,
          data: { block },
        } = await this.sidecar.getBlockByHash(hash);

        this.checkSidecarStatus<JsonBlock>(status, block, () =>
          this.getBlockByHash(hash)
        );

        return block;
      } catch (e) {
        console.log("Error requesting block by hash from sidecar.");

        this.isSidecarRunning = false;
        return this.getBlockByHash(hash);
      }
    }

    const { block } = await this.jsonRpc.getBlockInfo(hash);

    return block;
  }

  async getDeploy(hash: string) {
    if (this.isSidecarRunning) {
      try {
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

        this.checkSidecarStatus(status, deploy_accepted, () =>
          this.getDeploy(hash)
        );

        return { deploy: deploy_accepted, executionResults };
      } catch (e) {
        console.log("Error requesting deploy by hash from sidecar.", e);

        this.isSidecarRunning = false;
        return this.getDeploy(hash);
      }
    }

    const { deploy, execution_results: executionResults } =
      await this.jsonRpc.getDeployInfo(hash);

    return { deploy, executionResults };
  }

  async getDeploys(count = 10, pageNum = 1) {
    if (this.isSidecarRunning) {
      try {
        const {
          status,
          data: { data },
        } = await this.sidecar.getDeploys(count, pageNum);

        this.checkSidecarStatus(status, data, () => this.getDeploys());

        return data;
      } catch (e) {
        console.log("Error requesting deploys from sidecar.", e);

        this.isSidecarRunning = false;
        return this.getDeploys();
      }
    }

    return [];
  }
}
