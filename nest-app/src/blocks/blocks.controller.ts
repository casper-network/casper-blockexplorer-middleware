import { Controller, Get, Param, Query } from "@nestjs/common";
import { Transform } from "class-transformer";
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  registerDecorator,
  ValidationOptions,
} from "class-validator";
import { Block } from "src/types/api";
import { isValidHash } from "src/utils/validate";
import { Sort } from "src/validators/validators.service";
import { BlocksService } from "./blocks.service";

export class BlocksQueryDtp {
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  public pageNum: number = 1;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  public count: number = 10;

  @IsString()
  @IsOptional()
  public sortBy: string;

  @IsIn(["desc", "asc"])
  @IsString()
  @IsOptional()
  public orderBy: Sort = "desc";
}

export const IsValidHash = (
  property: string,
  validationOptions?: ValidationOptions
) => {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isValidHash",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string) {
          return /^\d+$/.test(value) || isValidHash(value);
        },
      },
    });
  };
};

export class BlocksByHashOrHeightParamDtp {
  @IsValidHash("hashOrHeight", { message: "Not a valid hash." })
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
