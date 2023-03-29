import { Injectable } from "@nestjs/common";
import { JsonDeploy, JsonExecutionResult } from "casper-js-sdk";
import { Deploy } from "casper-js-sdk/dist/lib/DeployUtil";
import { jsonRpc } from "src/blocks/blocks.service";

@Injectable()
export class DeploysService {
  async getDeploy(
    hash: string
  ): Promise<JsonDeploy & { execution_results: JsonExecutionResult[] }> {
    const { deploy, execution_results } = await jsonRpc.getDeployInfo(hash);

    return { ...deploy, execution_results };
  }
}
