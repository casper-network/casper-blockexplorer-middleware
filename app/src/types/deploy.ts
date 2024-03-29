/* eslint-disable  @typescript-eslint/no-explicit-any */
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

export interface GetDeploy {
  timestamp: string;
  dateTime: Date | string;
  deployHash: string;
  blockHash: string;
  publicKey: string;
  action: string;
  deployType: string | undefined;
  paymentAmount: string;
  cost: string;
  status: DeployStatus;
  rawDeploy: string;
}
