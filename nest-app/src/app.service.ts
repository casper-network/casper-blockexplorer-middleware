import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Cache } from "cache-manager";
import { GetStatusResult } from "casper-js-sdk";
import { jsonRpc } from "./main";

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async onModuleInit() {
    await this.getStatus();
  }

  @Cron("*/30 * * * *")
  async handleCron() {
    const overrideCache = true;
    await this.getStatus(overrideCache);
  }

  async getStatus(overrideCache?: boolean) {
    const cachedStatus = await this.cacheManager.get<GetStatusResult>("status");

    if (cachedStatus && !overrideCache) {
      return cachedStatus;
    }

    const status = await jsonRpc.getStatus();

    await this.cacheManager.set("status", status);

    return status;
  }
}
