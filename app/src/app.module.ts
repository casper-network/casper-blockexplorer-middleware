import { CacheModule, Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { AccountModule } from "./accounts/accounts.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BlocksModule } from "./blocks/blocks.module";
import { NODE_CACHE_LIMIT } from "./config";
import { DeploysModule } from "./deploys/deploys.module";
import { GatewayModule } from "./gateway/gateway.module";
import { PeersModule } from "./peers/peers.module";
import { ValidatorsModule } from "./validators/validators.module";

@Module({
  imports: [
    BlocksModule,
    ValidatorsModule,
    PeersModule,
    DeploysModule,
    AccountModule,
    GatewayModule,
    ScheduleModule.forRoot(),
    CacheModule.register({ ttl: Number.MAX_VALUE, max: NODE_CACHE_LIMIT }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
