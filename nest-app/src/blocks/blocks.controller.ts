import { Controller, Get } from '@nestjs/common';
import { BlocksService } from './blocks.service';

@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get('latest-block')
  async getLatestBlock() {
    const latestBlock = await this.blocksService.getLatestBlock();

    return latestBlock;
  }
}
