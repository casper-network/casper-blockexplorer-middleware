import { CacheModule, Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";

@Module({
  imports: [CacheModule.register({ ttl: Number.MAX_VALUE, max: 2 ** 19 })],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
