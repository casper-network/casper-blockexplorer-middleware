import { ValidatorBid, ValidatorWeight } from "casper-js-sdk";

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
  validators: ValidatorProcessed[];
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
