import { Controller, Get, Query } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";
import { PeersService } from "./peers.service";

export class PeersQueryDtp {
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  public pageNum: number = 1;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  public count: number = 10;
}

@Controller("peers")
export class PeersController {
  constructor(private readonly peersService: PeersService) {}

  @Get()
  async getPeers(@Query() query: PeersQueryDtp) {
    const { pageNum, count } = query;

    // const peers = this.peersService.getPeers()

    console.log("in getPeers");
  }
}
