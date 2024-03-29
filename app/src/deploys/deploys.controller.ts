import { Controller, Get, Param, Query } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { Sort } from "src/types/api";
import { IsValidHash, ValidationError } from "src/utils/nest-validation";

import { DeploysService } from "./deploys.service";

export class DeploysQueryDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  public pageNum = 1;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  public count = 10;

  @IsIn(["block_timestamp"])
  @IsString()
  @IsOptional()
  public sortBy: string;

  @IsIn(["desc", "asc"])
  @IsString()
  @IsOptional()
  public orderBy: Sort = "desc";
}

export class DeploysByHashParamsDto {
  @IsValidHash("hash", { message: ValidationError.Hash })
  @IsString()
  public hash: string;
}

@Controller("deploys")
export class DeploysController {
  constructor(private readonly deploysService: DeploysService) {}

  @Get(":hash")
  async getDeployByHash(@Param() params: DeploysByHashParamsDto) {
    const { hash } = params;

    const deploy = await this.deploysService.getDeploy(hash);

    return deploy;
  }

  @Get()
  async getDeploys(@Query() query: DeploysQueryDto) {
    const { count, pageNum, sortBy, orderBy } = query;

    const deploys = await this.deploysService.getDeploys(
      count,
      pageNum,
      sortBy,
      orderBy
    );

    return deploys;
  }
}
