import { Controller, Get, Query } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { ValidatorProcessed } from "src/types/validators";
import { Sort, ValidatorsService } from "./validators.service";

// TODO: maybe this should be used for all pagination requests?
export class ValidatorsQueryDtp {
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  public pageNum: number = 1;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  public count: number = 10;

  @IsString()
  @IsOptional()
  public sortBy: keyof ValidatorProcessed;

  @IsIn(["desc", "asc"])
  @IsString()
  @IsOptional()
  public orderBy: Sort = "desc";
}

@Controller("validators")
export class ValidatorsController {
  constructor(private readonly validatorsService: ValidatorsService) {}

  @Get("current-era-validators")
  async getCurrentEraValidators(@Query() query: ValidatorsQueryDtp) {
    const { count, orderBy, pageNum, sortBy } = query;

    const validators = await this.validatorsService.getCurrentEraValidators(
      count,
      pageNum,
      sortBy,
      orderBy
    );

    return { validators };
  }

  @Get("current-era-validators-status")
  async getCurrentEraValidatorStatus() {
    const currentEraValidatorStatus =
      await this.validatorsService.getCurrentEraValidatorStatus();

    return currentEraValidatorStatus;
  }
}
