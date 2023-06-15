import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Cache } from "cache-manager";
import { CLValueParsers } from "casper-js-sdk";
import { StatusCodes } from "http-status-codes";
import { BLOCK_GENERATE_INTERVAL } from "src/config";
import { GatewayService } from "src/gateway/gateway.service";
import { onChain } from "src/main";
import { SidecarDeploy } from "src/types/api";
import { DeployStatus, GetDeploy } from "src/types/deploy";
import { ApiError } from "src/utils/ApiError";
import {
  determineDeploySessionData,
  JsonDeploySession,
} from "src/utils/deploy";

@Injectable()
export class DeploysService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(GatewayService) private readonly gateway: GatewayService
  ) {}

  @Cron(`*/${BLOCK_GENERATE_INTERVAL / 2} * * * * *`, {
    name: "latestDeploySchedule",
  })
  async handleCron() {
    // TODO: notes for fetching (new) deploys on schedule and emitting to FE:
    // - fetch the latest deploy (i.e. page = 1, count = 1)
    // - check to see if in cache
    // -> if yes, do nothing
    // -> if no, add to cache + emit to FE
    // On FE:
    // - check to see where it fits in within the current sorting in table
    // + and then dynamically insert accordingly
    // NB: check what FE does for blocks if not on page 1 (or like page 1 but asc sorting)

    const [latestDeploy] = await this.getDeploys(
      1,
      1,
      "block_timestamp",
      "desc"
    );

    const cachedDeploy = await this.cacheManager.get(latestDeploy.deploy_hash);

    if (!cachedDeploy) {
      await this.cacheManager.set(latestDeploy.deploy_hash, latestDeploy);

      this.gateway.handleEvent("latest_deploy", { latestDeploy });
    }

    console.log({ latestDeploy });
  }

  async getDeploy(hash: string): Promise<GetDeploy> {
    const cachedDeployByHash = await this.cacheManager.get<SidecarDeploy>(hash);

    let deploy: SidecarDeploy["deploy_accepted"];
    let executionResults: {
      block_hash: string;
      // TODO: properly type this as part of ticket #94
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      result: any;
    }[];
    if (cachedDeployByHash) {
      executionResults = [
        {
          block_hash: cachedDeployByHash.deploy_processed.block_hash,
          result: cachedDeployByHash.deploy_processed.execution_result,
        },
      ];

      deploy = cachedDeployByHash.deploy_accepted;
    } else {
      // TODO: properly type this as part of ticket #94
      const processedDeploy = await onChain.getDeploy(hash);

      deploy = processedDeploy.deploy;
      executionResults = processedDeploy.executionResults;
    }

    // @ts-ignore
    const paymentMap = new Map(deploy.payment.ModuleBytes?.args);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const paymentAmount = CLValueParsers.fromJSON(paymentMap.get("amount"))
      .unwrap()
      .value()
      .toString() as string;

    const { timestamp, account: publicKey } = deploy.header;

    const { block_hash: blockHash, result: executionResult } =
      executionResults[0];

    const status = executionResult.Success
      ? DeployStatus.Success
      : DeployStatus.Failed;

    const deploySession = deploy.session as unknown as JsonDeploySession;

    const { action, deployType } = determineDeploySessionData(
      deploySession,
      status
    );

    const cost = executionResult.Success
      ? executionResult.Success.cost
      : executionResult.Failure?.cost ?? 0;

    const dateTime = new Date(timestamp);

    return {
      timestamp,
      dateTime,
      deployHash: deploy.hash,
      blockHash,
      publicKey,
      action,
      deployType,
      paymentAmount,
      cost: cost.toString(),
      status,
      rawDeploy: JSON.stringify({
        deploy,
        execution_results: executionResults,
      }),
    };
  }

  async getDeploys(
    count = 10,
    pageNum = 1,
    sortBy = "block_timestamp",
    orderBy = "desc"
  ) {
    // TODO: how can we check to see if the specific page/count of deploys are in cache??
    // probably can't...
    const deploys = await onChain.getDeploys(count, pageNum, sortBy, orderBy);

    if (!deploys?.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Deploys not found.");
    }

    for (const deploy of deploys) {
      const cachedDeploy = await this.cacheManager.get(deploy.deploy_hash);

      if (!cachedDeploy) {
        await this.cacheManager.set(deploy.deploy_hash, deploy);
      }
    }

    return deploys;
  }
}
