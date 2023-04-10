import { CasperServiceByJsonRPC, ValidatorsInfoResult } from "casper-js-sdk";
import NodeCache from "node-cache";
import cron from "node-cron";

import { ERA_CHECK_PERIOD_MINUTES } from "../config";
import { Sort } from "../types";
import {
  ValidatorProcessed,
  ValidatorsProcessedWithStatus,
} from "../types/on-chain";
import { BlocksService } from "./blocks-service";
import { ActualBid } from "./rpc-client";

export class ValidatorsService {
  private cache: NodeCache;
  constructor(
    private readonly rpcClient: CasperServiceByJsonRPC,
    private readonly blocksService: BlocksService
  ) {
    this.cache = new NodeCache({ checkperiod: 0 });
    this.blocksService = blocksService;
  }

  async init() {
    await this.getCurrentEraValidators();

    // every 10th minute check to see if there is a new era
    cron.schedule(`*/${ERA_CHECK_PERIOD_MINUTES} * * * *`, async () => {
      const cachedValidatorsInfo =
        this.cache.get<ValidatorsProcessedWithStatus>(
          "processedValidatorsWithStatus"
        );

      const {
        header: { era_id: latestEraId },
      } = await this.blocksService.getLatestBlock();

      if (latestEraId !== cachedValidatorsInfo?.status.latestEraId) {
        await this.getCurrentEraValidators();
      }
    });
  }

  async getCurrentEraValidators(
    count?: number,
    pageNum?: number,
    sortBy?: keyof ValidatorProcessed,
    orderBy?: Sort
  ) {
    const cachedValidatorsInfo = this.cache.get<ValidatorsProcessedWithStatus>(
      "processedValidatorsWithStatus"
    );

    const {
      header: { era_id: latestEraId },
    } = await this.blocksService.getLatestBlock();

    if (
      cachedValidatorsInfo &&
      latestEraId === cachedValidatorsInfo.status.latestEraId
    ) {
      const sortedValidatorsInfo = this.sortValidators(
        cachedValidatorsInfo,
        sortBy,
        orderBy
      );

      return this.paginateValidators(sortedValidatorsInfo, count, pageNum);
    }

    const validatorsInfo = await this.rpcClient.getValidatorsInfo();

    const processedValidatorsWithStatus = this.processValidatorsInfoResult(
      validatorsInfo,
      latestEraId
    );

    this.cache.set(
      "processedValidatorsWithStatus",
      processedValidatorsWithStatus
    );

    const sortedValidatorsInfo = this.sortValidators(
      processedValidatorsWithStatus,
      sortBy,
      orderBy
    );

    return this.paginateValidators(sortedValidatorsInfo, count, pageNum);
  }

  async getCurrentEraValidatorStatus() {
    let currentValidatorsInfo: ValidatorsProcessedWithStatus;

    const cachedValidatorsInfo = this.cache.get<ValidatorsProcessedWithStatus>(
      "processedValidatorsWithStatus"
    );

    const {
      header: { era_id: latestEraId },
    } = await this.blocksService.getLatestBlock();

    if (
      cachedValidatorsInfo &&
      latestEraId === cachedValidatorsInfo.status.latestEraId
    ) {
      currentValidatorsInfo = cachedValidatorsInfo;
    } else {
      currentValidatorsInfo = await this.getCurrentEraValidators();
    }

    return {
      validatorsCount: currentValidatorsInfo.status.validatorsCount,
      bidsCount: currentValidatorsInfo.status.bidsCount,
    };
  }

  processValidatorsInfoResult(
    validatorsInfoResult: ValidatorsInfoResult,
    latestEraId: number
  ): ValidatorsProcessedWithStatus {
    const activeValidators =
      validatorsInfoResult.auction_state.era_validators.find(
        ({ era_id }) => era_id === latestEraId
      )?.validator_weights ?? [];

    const allBids = validatorsInfoResult.auction_state.bids;

    const activeBids = allBids.filter(
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

      const associatedBid = allBids.find(
        (bid) => bid.public_key === validator.public_key
      );

      if (associatedBid) {
        processedValidator.feePercentage = associatedBid.bid.delegation_rate;
        processedValidator.delegatorsCount =
          associatedBid.bid.delegators.length;
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
  }

  paginateValidators(
    validatorsInfo: ValidatorsProcessedWithStatus,
    count?: number,
    pageSize?: number
  ): ValidatorsProcessedWithStatus {
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
  }

  sortValidators(
    validatorsInfo: ValidatorsProcessedWithStatus,
    sortBy?: keyof ValidatorProcessed,
    orderBy?: Sort
  ) {
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
  }
}