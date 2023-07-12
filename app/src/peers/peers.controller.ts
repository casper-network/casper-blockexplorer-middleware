import { Controller, Get, Query } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

import { PeersService } from "./peers.service";

export class PeersQueryDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  public pageNum = 1;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  public count = 10;
}

@Controller("peers")
export class PeersController {
  constructor(private readonly peersService: PeersService) {}

  @Get()
  async getPeers(@Query() query: PeersQueryDto) {
    const { pageNum, count } = query;

    const peers = await this.peersService.getPeers(count, pageNum);

    return peers;
  }
}
