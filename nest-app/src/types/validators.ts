import { ValidatorBid, ValidatorWeight } from "casper-js-sdk";

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
