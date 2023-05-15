/* eslint-disable  @typescript-eslint/no-explicit-any */
import { CLValueParsers } from "casper-js-sdk";
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
  amount?: string;
} = (deploySession, deployStatus) => {
  let sessionMap: Map<unknown, unknown>;
  let action = "N/A";
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

    if (typedDeploySession.StoredContractByHash) {
      deployType = "StoredContractByHash";
      action = typedDeploySession.StoredContractByHash.entry_point;
      sessionMap = new Map(typedDeploySession.StoredContractByHash.args);
    } else if (typedDeploySession.StoredVersionedContractByName) {
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
  const amount = sessionMap.get("amount")
    ? (CLValueParsers.fromJSON(sessionMap.get("amount"))
        .unwrap()
        .value()
        .toString() as string)
    : // TODO: will update and potentially remove "amount" in #67
      "0";

  return { action, deployType, amount };
};
