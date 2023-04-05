import { Injectable } from "@nestjs/common";
import { CLValueParsers, JsonDeploy, JsonExecutionResult } from "casper-js-sdk";
import { jsonRpc } from "src/main";

import format from "date-fns/format";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);

const timeAgo = new TimeAgo("en-US");

export const defaultDateFormat = "MMM do yyyy, h:mm:ss a";

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

export const formatDate = (date: Date) => {
  const readableTimestamp = format(date, defaultDateFormat);
  return readableTimestamp;
};

export const formatTimeAgo = (date: Date) => {
  const age = timeAgo.format(date, "round");
  return age;
};

@Injectable()
export class DeploysService {
  async getDeploy(hash: string): Promise<{
    timestamp: number;
    timeSince: string;
    readableTimestamp: string;
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

    const timeSince = formatTimeAgo(dateTime);
    const readableTimestamp = formatDate(dateTime);

    return {
      timestamp,
      timeSince,
      readableTimestamp,
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
