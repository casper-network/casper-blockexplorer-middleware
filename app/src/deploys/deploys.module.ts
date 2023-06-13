import { CacheModule, Module } from "@nestjs/common";

import { DeploysController } from "./deploys.controller";
import { DeploysService } from "./deploys.service";
import { NODE_CACHE_LIMIT } from "src/config";

@Module({
  imports: [
    CacheModule.register({ ttl: Number.MAX_VALUE, max: NODE_CACHE_LIMIT }),
  ],
  controllers: [DeploysController],
  providers: [DeploysService],
})
export class DeploysModule {}
