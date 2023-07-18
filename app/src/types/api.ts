/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Bid, ValidatorBid, ValidatorWeight } from "casper-js-sdk";

export interface Peer {
  nodeId: string;
  address: string;
}

export interface PeersWithAliveStatus extends Peer {
  isAlive?: boolean | null;
  uptime?: string | null;
  lastAddedBlockHash?: string | null;
}

export interface ValidatorInfo {
  activeValidators: ValidatorWeight[];
  activeBids: ValidatorBid[];
}

export interface ValidatorProcessed {
  rank: number;
  publicKey: string;
  feePercentage: number;
  delegatorsCount: number;
  totalStakeMotes: number;
  selfPercentage: number;
  percentageOfNetwork: number;
}

export interface ValidatorsProcessedWithStatus {
  currentEraValidators: ValidatorProcessed[];
  nextEraValidators: ValidatorProcessed[];
  status: {
    validatorsCount: number;
    bidsCount: number;
    latestEraId: number;
  };
}

export interface Block {
  hash: string;
  header: Header;
  body: Body;
  proofs: Proof[];
}

export interface Proof {
  public_key: string;
  signature: string;
}

export interface Body {
  proposer: string;
  deploy_hashes: string[];
  transfer_hashes: string[];
}

export interface Header {
  parent_hash: string;
  state_root_hash: string;
  body_hash: string;
  random_bit: boolean;
  accumulated_seed: string;
  era_end: null;
  timestamp: string;
  era_id: number;
  height: number;
  protocol_version: string;
}

export type Sort = "desc" | "asc";
export interface ActualBid extends Bid {
  inactive: boolean;
}

export interface ExecutableDeployItem {
  ModuleBytes?: {
    // args is very complicated and is not required for BE for the time being
    args: any[];
    module_bytes: string;
  };
  StoredContractByHash?: {
    args: any[];
    entry_point: string;
    hash: string;
  };
  StoredVersionedContractByName?: {
    args: any[];
    entry_point: string;
    name: string;
  };
  Transfer?: { args: any[] };
}

export interface SidecarDeploy {
  deploy_hash: string;
  deploy_accepted: {
    hash: string;
    header: {
      account: string;
      timestamp: string;
      ttl: string;
      gas_price: number;
      body_hash: string;
      dependencies: string[];
      chain_name: string;
    };
    payment: ExecutableDeployItem;
    session: ExecutableDeployItem;
    approvals: { signature: string; signer: string }[];
  };
  deploy_processed: {
    deploy_hash: string;
    account: string;
    timestamp: string;
    ttl: string;
    dependencies: string[];
    block_hash: string;
    execution_result: {
      Failure?: { cost?: number };
      Success?: { cost?: number };
    };
  };
  deploy_expired: boolean;
}
