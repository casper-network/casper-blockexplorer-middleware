import { CacheModule, Module } from "@nestjs/common";
import { NODE_CACHE_LIMIT } from "src/config";

import { PeersController } from "./peers.controller";
import { PeersService } from "./peers.service";

@Module({
  imports: [
    CacheModule.register({ ttl: Number.MAX_VALUE, max: NODE_CACHE_LIMIT }),
  ],
  controllers: [PeersController],
  providers: [PeersService],
})
export class PeersModule {}
