import { Injectable } from "@nestjs/common";
import { CLValueParsers } from "casper-js-sdk";
import { jsonRpc } from "src/main";

// TODO: move all these types
export enum DeployStatus {
  Success = "Success",
  Failed = "Failed",
}

interface EntryPointSession {
  args: any[];
  hash: string;
  entry_point: string;
}

export interface JsonDeployEntryPointSession {
  StoredContractByHash?: EntryPointSession;
  StoredVersionedContractByName?: EntryPointSession;
}

export interface JsonDeployTransferSession {
  Transfer: {
    args: any[];
  };
}

export interface JsonDeployWasmSession {
  ModuleBytes: {
    args: any[];
    module_bytes: string;
  };
}

export type JsonDeploySession =
  | JsonDeployTransferSession
  | JsonDeployWasmSession
  | JsonDeployEntryPointSession;

export const isEntryPointDeploy = (
  deploySession: JsonDeploySession | any
): deploySession is JsonDeploySession => {
  const storedContractByHash = (deploySession as JsonDeployEntryPointSession)
    .StoredContractByHash;

  const storedVersionedContractByName = (
    deploySession as JsonDeployEntryPointSession
  ).StoredVersionedContractByName;

  return !!storedContractByHash || !!storedVersionedContractByName;
};

export const isTransferDeploy = (
  deploySession: JsonDeploySession | any
): deploySession is JsonDeploySession => {
  return !!(deploySession as JsonDeployTransferSession).Transfer;
};

export const isWasmDeploy = (
  deploySession: JsonDeploySession | any
): deploySession is JsonDeploySession => {
  return !!(deploySession as JsonDeployWasmSession).ModuleBytes;
};

export const determineDeploySessionData: (
  deploySession: JsonDeploySession,
  deployStatus: DeployStatus
) => {
  action: string;
  deployType?: string;
  amount?: string;
} = (deploySession, deployStatus) => {
  let sessionMap: Map<unknown, unknown>;
  let action: string = "N/A";
  let deployType: string | undefined;

  if (isWasmDeploy(deploySession)) {
    action = "WASM deploy";
    sessionMap = new Map(
      (deploySession as JsonDeployWasmSession).ModuleBytes.args
    );
  } else if (isTransferDeploy(deploySession)) {
    action = "Transfer";
    sessionMap = new Map(
      (deploySession as JsonDeployTransferSession).Transfer.args
    );
  } else if (isEntryPointDeploy(deploySession)) {
    const typedDeploySession = deploySession as JsonDeployEntryPointSession;

    if (!!typedDeploySession.StoredContractByHash) {
      deployType = "StoredContractByHash";
      action = typedDeploySession.StoredContractByHash.entry_point;
      sessionMap = new Map(typedDeploySession.StoredContractByHash.args);
    } else if (!!typedDeploySession.StoredVersionedContractByName) {
      deployType = "StoredVersionContractByName";
      action = typedDeploySession.StoredVersionedContractByName.entry_point;
      sessionMap = new Map(
        typedDeploySession.StoredVersionedContractByName.args
      );
    } else {
      return { action };
    }

    return { deployType, action };
  } else {
    return { action };
  }

  if (deployStatus === DeployStatus.Failed) {
    return { action };
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const amount = CLValueParsers.fromJSON(sessionMap.get("amount"))
    .unwrap()
    .value()
    .toString() as string;

  return { action, deployType, amount };
};

@Injectable()
export class DeploysService {
  // TODO: move this return type somewhere?
  async getDeploy(hash: string): Promise<{
    timestamp: number;
    dateTime: Date | string;
    deployHash: string;
    blockHash: string;
    publicKey: string;
    action: string;
    deployType: string | undefined;
    amount: string | undefined;
    paymentAmount: string;
    cost: string;
    status: DeployStatus;
    rawDeploy: string;
  }> {
    const { deploy, execution_results: executionResults } =
      await jsonRpc.getDeployInfo(hash);

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

    // return { ...deploy, execution_results };
  }
}
