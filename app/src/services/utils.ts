import { ValidatorInfo } from "../types/on-chain";

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
