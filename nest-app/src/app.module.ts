import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AccountModule } from "./account/account.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BlocksModule } from "./blocks/blocks.module";
import { DeploysModule } from "./deploys/deploys.module";
import { PeersModule } from "./peers/peers.module";
import { ValidatorsModule } from "./validators/validators.module";

@Module({
  imports: [
    BlocksModule,
    ValidatorsModule,
    PeersModule,
    DeploysModule,
    AccountModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
