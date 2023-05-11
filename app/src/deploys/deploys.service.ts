import { Injectable } from "@nestjs/common";
import { CLValueParsers } from "casper-js-sdk";
import { jsonRpc, onChain } from "src/main";
import { DeployStatus, GetDeploy } from "src/types/deploy";
import {
  determineDeploySessionData,
  JsonDeploySession,
} from "src/utils/deploy";

@Injectable()
export class DeploysService {
  async getDeploy(hash: string): Promise<GetDeploy> {
    console.log("deploy hash", hash);

    // const { deploy, execution_results: executionResults } =
    // await jsonRpc.getDeployInfo(hash);

    const { deploy, executionResults } = await onChain.getDeploy(hash);

    console.log({ deploy, executionResults });

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

    console.log({ deploySession });
    console.log({ status });

    const { action, deployType, amount } = determineDeploySessionData(
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
      amount,
      paymentAmount,
      cost: cost.toString(),
      status,
      rawDeploy: JSON.stringify({
        deploy,
        execution_results: executionResults,
      }),
    };
  }
}
