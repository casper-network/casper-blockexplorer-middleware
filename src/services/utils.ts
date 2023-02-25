import { ValidatorsInfoResult } from "casper-js-sdk";
import {
  ValidatorInfo,
  ValidatorProcessed,
  ValidatorsProcessedWithStatus,
} from "../types/on-chain";
import { ActualBid } from "./rpc-client";

export const paginateValidators = (
  validatorsInfo: ValidatorsProcessedWithStatus,
  count?: number,
  pageSize?: number
): ValidatorsProcessedWithStatus => {
  if (count && pageSize) {
    return {
      ...validatorsInfo,
      validators: validatorsInfo.validators.slice(
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
): ValidatorsProcessedWithStatus => {
  const activeValidators =
    validatorsInfoResult.auction_state.era_validators.find(
      ({ era_id }) => era_id === latestEraId
    )?.validator_weights ?? [];

  const activeBids = validatorsInfoResult.auction_state.bids.filter(
    (validatorBid) => (validatorBid.bid as ActualBid).inactive === false
  );

  const totalActiveValidatorsStake = Object.values(activeValidators).reduce(
    (a, b) => a + parseInt(b.weight, 10),
    0
  );

  let processedValidators: ValidatorsProcessedWithStatus["validators"] = [];
  for (const validator of activeValidators) {
    const processedValidator = {} as ValidatorProcessed;
    const totalStakeCspr = parseInt(validator.weight, 10);

    processedValidator.publicKey = validator.public_key;
    processedValidator.totalStakeCspr = totalStakeCspr;

    const associatedBid = activeBids.find(
      (bid) => bid.public_key === validator.public_key
    );

    if (associatedBid) {
      processedValidator.feePercentage = associatedBid.bid.delegation_rate;
      processedValidator.delegatorsCount = associatedBid.bid.delegators.length;
      processedValidator.selfPercentage =
        (parseInt(associatedBid.bid.staked_amount, 10) / totalStakeCspr) * 100;
      processedValidator.percentageOfNetwork =
        (totalStakeCspr / totalActiveValidatorsStake) * 100;
    }

    processedValidators.push(processedValidator);
  }

  // ranking
  processedValidators.sort((a, b) => b.totalStakeCspr - a.totalStakeCspr);
  let rank = 1;
  processedValidators.forEach((_, index) => {
    processedValidators[index].rank = rank;
    rank++;
  });

  return {
    validators: processedValidators,
    status: {
      activeValidatorsCount: activeValidators.length,
      activeBidsCount: activeBids.length,
    },
  };
};
