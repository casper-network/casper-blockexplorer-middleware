import { CacheModule, Module } from "@nestjs/common";
import { PeersController } from "./peers.controller";
import { PeersService } from "./peers.service";

@Module({
  imports: [CacheModule.register({ ttl: Number.MAX_VALUE, max: 2 ** 19 })],
  controllers: [PeersController],
  providers: [PeersService],
})
export class PeersModule {}
