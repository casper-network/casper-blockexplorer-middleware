import { Controller, Get, Param, Query } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { Block, Sort } from "src/types/api";
import { IsValidHash, ValidationError } from "src/utils/nest-validation";

import { BlocksService } from "./blocks.service";

export class BlocksQueryDtp {
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  public pageNum = 1;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  public count = 10;

  @IsString()
  @IsOptional()
  public sortBy: string;

  @IsIn(["desc", "asc"])
  @IsString()
  @IsOptional()
  public orderBy: Sort = "desc";
}

export class BlocksByHashOrHeightParamDtp {
  @IsValidHash("hashOrHeight", { message: ValidationError.Hash })
  @IsString()
  public hashOrHeight: string;
}

@Controller("blocks")
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  async getBlocks(@Query() query: BlocksQueryDtp) {
    const { count, orderBy, pageNum } = query;

    const blocks = this.blocksService.getBlocks(count, orderBy, pageNum);

    return blocks;
  }

  @Get("latest-block")
  async getLatestBlock() {
    const latestBlock = await this.blocksService.getLatestBlock();

    return latestBlock;
  }

  @Get(":hashOrHeight")
  async getBlockByHashOrHeight(@Param() params: BlocksByHashOrHeightParamDtp) {
    const { hashOrHeight } = params;

    let block: Block;
    if (/^\d+$/.test(hashOrHeight)) {
      block = await this.blocksService.getBlockByHeight(parseInt(hashOrHeight));
    } else {
      block = await this.blocksService.getBlock(hashOrHeight);
    }

    return block;
  }
}
