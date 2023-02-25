import { ValidatorsInfoResult } from "casper-js-sdk";
import { ValidatorInfo, ValidatorsProcessed } from "../types/on-chain";
import { ActualBid } from "./rpc-client";

export const paginateValidators = (
  validatorsInfo: ValidatorInfo,
  count?: number,
  pageSize?: number
): ValidatorInfo => {
  if (count && pageSize) {
    return {
      ...validatorsInfo,
      activeValidators: validatorsInfo.activeValidators.slice(
        (pageSize - 1) * count,
        pageSize * count
      ),
    };
  }

  return validatorsInfo;
};

export const processValidatorsInfoResult = (
  validatorsInfoResult: ValidatorsInfoResult,
  latestEraId: number
): ValidatorsProcessed => {
  const activeValidators =
    validatorsInfoResult.auction_state.era_validators.find(
      ({ era_id }) => era_id === latestEraId
    )?.validator_weights ?? [];

  const activeBids = validatorsInfoResult.auction_state.bids.filter(
    (validatorBid) => (validatorBid.bid as ActualBid).inactive === false
  );

  const processedValidatorsData = {} as ValidatorsProcessed["validators"];
  for (const validator of activeValidators) {
    const totalStakeCspr = parseInt(validator.weight, 10);

    processedValidatorsData.publicKey = validator.public_key;
    processedValidatorsData.totalStakeCspr = totalStakeCspr;

    const associatedBid = activeBids.find(
      (bid) => bid.public_key === validator.public_key
    );

    if (associatedBid) {
      processedValidatorsData.feePercentage = associatedBid.bid.delegation_rate;
      processedValidatorsData.delegatorsCount =
        associatedBid.bid.delegators.length;
      processedValidatorsData.selfPercentage =
        (parseInt(associatedBid.bid.staked_amount, 10) / totalStakeCspr) * 100;
    }
  }

  // TODO: probably rank as the last thing we do - will use the totalStake as a ranker

  return {
    validators: {},
    status: {
      activeValidatorsCount: activeValidators.length,
      activeBidsCount: activeBids.length,
    },
  } as ValidatorsProcessed;
};
