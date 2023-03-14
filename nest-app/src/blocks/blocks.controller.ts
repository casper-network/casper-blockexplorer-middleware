import { Controller, Get, Query } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { BlocksService } from "./blocks.service";

export class BlocksQueryDtp {
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  public pageNum: number = 1;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  public count: number = 10;

  // TODO: add @IsIn check?
  @IsString()
  @IsOptional()
  public sortBy: string;

  @IsIn(["desc", "asc"])
  @IsString()
  @IsOptional()
  public orderBy: string = "desc";
}

@Controller("blocks")
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get("latest-block")
  async getLatestBlock() {
    const latestBlock = await this.blocksService.getLatestBlock();

    return latestBlock;
  }

  @Get()
  async getBlocks(@Query() query: BlocksQueryDtp) {
    console.log({ query });

    const blocks = this.blocksService.getBlocks(
      query.count,
      query.orderBy,
      query.pageNum
    );

    return blocks;
  }
}
