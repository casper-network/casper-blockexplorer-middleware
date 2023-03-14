import { Module, CacheModule } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BlocksController } from "./blocks/blocks.controller";
import { BlocksModule } from "./blocks/blocks.module";
import { BlocksService } from "./blocks/blocks.service";

@Module({
  imports: [BlocksModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
