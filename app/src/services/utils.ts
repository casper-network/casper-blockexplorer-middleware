import { ValidatorsInfoResult } from "casper-js-sdk";
import { Sort } from "../types";

import {
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

export const sortValidators = (
  validatorsInfo: ValidatorsProcessedWithStatus,
  sortBy?: keyof ValidatorProcessed,
  orderBy?: Sort
) => {
  if (sortBy && orderBy) {
    validatorsInfo.validators.sort((a, b) => {
      const firstAccessor = sortBy in a ? a[sortBy] : a["totalStakeMotes"];

      const secondAccessor = sortBy in b ? b[sortBy] : b["totalStakeMotes"];

      if (firstAccessor < secondAccessor) {
        return orderBy === "DESC" ? 1 : -1;
      }

      if (firstAccessor > secondAccessor) {
        return orderBy === "DESC" ? -1 : 1;
      }

      return 0;
    });
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

  const processedValidators: ValidatorsProcessedWithStatus["validators"] = [];
  for (const validator of activeValidators) {
    const processedValidator = {} as ValidatorProcessed;
    const totalStakeMotes = parseInt(validator.weight, 10);

    processedValidator.publicKey = validator.public_key;
    processedValidator.totalStakeMotes = totalStakeMotes;

    const associatedBid = activeBids.find(
      (bid) => bid.public_key === validator.public_key
    );

    if (associatedBid) {
      processedValidator.feePercentage = associatedBid.bid.delegation_rate;
      processedValidator.delegatorsCount = associatedBid.bid.delegators.length;
      processedValidator.selfPercentage = Number(
        (
          (parseInt(associatedBid.bid.staked_amount, 10) / totalStakeMotes) *
          100
        ).toFixed(2)
      );
      processedValidator.percentageOfNetwork = Number(
        ((totalStakeMotes / totalActiveValidatorsStake) * 100).toFixed(2)
      );
    }

    processedValidators.push(processedValidator);
  }

  // ranking
  processedValidators.sort((a, b) => b.totalStakeMotes - a.totalStakeMotes);
  let rank = 1;
  processedValidators.forEach((_, index) => {
    processedValidators[index].rank = rank;
    rank++;
  });

  return {
    validators: processedValidators,
    status: {
      validatorsCount: activeValidators.length,
      bidsCount: activeBids.length,
      latestEraId,
    },
  };
};
