/* eslint @typescript-eslint/no-var-requires: "off" */
import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Cache } from "cache-manager";
import { GetStatusResult } from "casper-js-sdk";

import { version } from "../package.json";
import { jsonRpc, onChain, sidecar } from "./main";

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async onModuleInit() {
    const isSidecarRunning = await sidecar.getIsSidecarRunning();

    onChain.isSidecarRunning = isSidecarRunning;

    await this.getStatus();
  }

  @Cron("*/10 * * * *")
  async handleSidecarCron() {
    const isSidecarRunning = await sidecar.getIsSidecarRunning();

    onChain.isSidecarRunning = isSidecarRunning;
  }

  @Cron("*/30 * * * *")
  async handleStatusCron() {
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

  async getVersion() {
    const hash = require("child_process")
      .execSync("git rev-parse HEAD")
      .toString()
      .trim();

    return { hash, version };
  }
}
