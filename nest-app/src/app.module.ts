import { Module, CacheModule } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BlocksService } from "./blocks/blocks.service";

@Module({
  imports: [
    // can override these config values using decorators on individual service classes
    CacheModule.register({ ttl: Number.MAX_VALUE, max: 2 ** 19 }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, BlocksService],
})
export class AppModule {}
