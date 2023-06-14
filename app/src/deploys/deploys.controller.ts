import { Controller, Get, Param, Query } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { IsValidHash, ValidationError } from "src/utils/nest-validation";

import { DeploysService } from "./deploys.service";
import { Sort } from "src/types/api";

export class DeploysQueryDtp {
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  public pageNum = 1;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  public count = 10;

  // TODO: will add more sorting options #88
  @IsIn(["block_timestamp"])
  @IsString()
  @IsOptional()
  public sortBy: string;

  @IsIn(["desc", "asc"])
  @IsString()
  @IsOptional()
  public orderBy: Sort = "desc";
}

export class DeploysByHashParamsDtp {
  @IsValidHash("hash", { message: ValidationError.Hash })
  @IsString()
  public hash: string;
}

@Controller("deploys")
export class DeploysController {
  constructor(private readonly deploysService: DeploysService) {}

  @Get(":hash")
  async getDeployByHash(@Param() params: DeploysByHashParamsDtp) {
    const { hash } = params;

    const deploy = await this.deploysService.getDeploy(hash);

    return deploy;
  }

  @Get()
  async getDeploys(@Query() query: DeploysQueryDtp) {
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
