import { CacheModule, Module } from "@nestjs/common";
import { BlocksService } from "src/blocks/blocks.service";
import { ValidatorsController } from "./validators.controller";
import { ValidatorsService } from "./validators.service";

@Module({
  imports: [CacheModule.register({ ttl: Number.MAX_VALUE, max: 2 ** 19 })],
  controllers: [ValidatorsController],
  providers: [ValidatorsService, BlocksService],
})
export class ValidatorsModule {}
