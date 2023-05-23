import { CacheModule, Module } from "@nestjs/common";
import { BlocksService } from "src/blocks/blocks.service";
import { NODE_CACHE_LIMIT } from "src/config";
import { GatewayService } from "src/gateway/gateway.service";

import { ValidatorsController } from "./validators.controller";
import { ValidatorsService } from "./validators.service";

@Module({
  imports: [
    CacheModule.register({ ttl: Number.MAX_VALUE, max: NODE_CACHE_LIMIT }),
  ],
  controllers: [ValidatorsController],
  providers: [ValidatorsService, BlocksService, GatewayService],
})
export class ValidatorsModule {}
