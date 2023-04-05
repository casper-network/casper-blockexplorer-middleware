import { CacheModule, Module } from "@nestjs/common";
import { NODE_CACHE_LIMIT } from "src/config";

import { BlocksController } from "./blocks.controller";
import { BlocksService } from "./blocks.service";

@Module({
  imports: [
    CacheModule.register({ ttl: Number.MAX_VALUE, max: NODE_CACHE_LIMIT }),
  ],
  controllers: [BlocksController],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlocksModule {}
