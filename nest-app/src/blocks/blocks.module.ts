import { CacheModule, Module } from "@nestjs/common";
import { BlocksController } from "./blocks.controller";
import { BlocksService } from "./blocks.service";

@Module({
  imports: [CacheModule.register({ ttl: Number.MAX_VALUE, max: 2 ** 19 })],
  controllers: [BlocksController],
  providers: [BlocksService],
})
export class BlocksModule {}
