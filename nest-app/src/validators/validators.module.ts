import { CacheModule, Module } from "@nestjs/common";

@Module({
  imports: [CacheModule.register({ ttl: Number.MAX_VALUE, max: 2 ** 19 })],
  controllers: [],
  providers: [],
})
export class ValidatorsModule {}
