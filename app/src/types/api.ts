/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Bid, ValidatorBid, ValidatorWeight } from "casper-js-sdk";

export interface Peer {
  nodeId: string;
  address: string;
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
      dependencies: any[];
      chain_name: string;
    };
    payment: { ModuleBytes: any[] };
    session: { ModuleBytes: any[] };
    approvals: any[];
  };
  deploy_processed: {
    deploy_hash: string;
    account: string;
    timestamp: string;
    ttl: string;
    dependencies: any[];
    block_hash: string;
    execution_result: { Failure: object };
  };
  deploy_expired: boolean;
}
