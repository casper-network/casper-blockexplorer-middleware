/* eslint-disable  @typescript-eslint/no-explicit-any */
import { CLValueParsers } from "casper-js-sdk";
import { SidecarDeploy } from "src/types/api";
import {
  DeployStatus,
  JsonDeployEntryPointSession,
  JsonDeployTransferSession,
  JsonDeployWasmSession,
} from "src/types/deploy";

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
} = (deploySession, deployStatus) => {
  let action = "N/A";
  let deployType: string | undefined;

  if (isWasmDeploy(deploySession)) {
    action = "WASM deploy";
  } else if (isTransferDeploy(deploySession)) {
    action = "Transfer";
  } else if (isEntryPointDeploy(deploySession)) {
    const typedDeploySession = deploySession as JsonDeployEntryPointSession;

    if (typedDeploySession.StoredContractByHash) {
      deployType = "StoredContractByHash";
      action = typedDeploySession.StoredContractByHash.entry_point;
    } else if (typedDeploySession.StoredVersionedContractByName) {
      deployType = "StoredVersionContractByName";
      action = typedDeploySession.StoredVersionedContractByName.entry_point;
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

  return { action, deployType };
};

export const getProcessedSidecarDeploys = (deploys: SidecarDeploy[]) => {
  const processedDeploys = deploys.map((deploy) => {
    const costMotes = deploy.deploy_processed.execution_result.Success
      ? deploy.deploy_processed.execution_result.Success.cost
      : deploy.deploy_processed.execution_result.Failure?.cost ?? 0;
    const deployAcceptedSession = deploy.deploy_accepted.session;

    let amountMap: Map<string, string>;
    let contractType: string;
    if (deployAcceptedSession.ModuleBytes) {
      amountMap = new Map(deployAcceptedSession.ModuleBytes?.args);
      contractType = "WASM deploy";
    } else if (deployAcceptedSession.Transfer) {
      amountMap = new Map(deployAcceptedSession.Transfer?.args);
      contractType = "Transfer";
    } else if (deployAcceptedSession.StoredContractByHash) {
      amountMap = new Map(deployAcceptedSession.StoredContractByHash?.args);
      contractType = deployAcceptedSession.StoredContractByHash.entry_point;
    } else {
      amountMap = new Map(
        deployAcceptedSession.StoredVersionedContractByName?.args
      );
      contractType =
        deployAcceptedSession.StoredVersionedContractByName.entry_point;
    }

    let amountMotes: string;
    if (amountMap.has("amount")) {
      amountMotes = CLValueParsers.fromJSON(amountMap.get("amount"))
        .unwrap()
        .value()
        .toString() as string;
    } else {
      amountMotes = "";
    }

    return {
      deployHash: deploy.deploy_hash,
      blockHash: deploy.deploy_processed.block_hash,
      publicKey: deploy.deploy_processed.account,
      timestamp: deploy.deploy_processed.timestamp,
      contractType,
      amountMotes,
      costMotes,
    };
  });

  return processedDeploys;
};
