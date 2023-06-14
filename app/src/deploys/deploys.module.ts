import { CacheModule, Module } from "@nestjs/common";
import { NODE_CACHE_LIMIT } from "src/config";

import { DeploysController } from "./deploys.controller";
import { DeploysService } from "./deploys.service";

@Module({
  imports: [
    CacheModule.register({ ttl: Number.MAX_VALUE, max: NODE_CACHE_LIMIT }),
  ],
  controllers: [DeploysController],
  providers: [DeploysService],
})
export class DeploysModule {}
