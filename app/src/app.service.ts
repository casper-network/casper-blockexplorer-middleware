/* eslint @typescript-eslint/no-var-requires: "off" */
import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Cache } from "cache-manager";
import { GetStatusResult } from "casper-js-sdk";

import { jsonRpc, onChain, sidecar } from "./main";
import { version } from "../package.json";

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async onModuleInit() {
    const isSidecarRunning = await sidecar.latestBlock();
    console.log("pre", onChain.isSidecarRunning);

    onChain.isSidecarRunning = !!isSidecarRunning.block.hash;

    await this.getStatus();
  }

  @Cron("*/10 * * * *")
  async handleSidecarCron() {
    // TODO: should we put this into a util method (since it's also called above)?
    const isSidecarRunning = await sidecar.latestBlock();
    console.log("pre", onChain.isSidecarRunning);

    onChain.isSidecarRunning = !!isSidecarRunning.block.hash;
  }

  @Cron("*/30 * * * *")
  async handleStatusCron() {
    const overrideCache = true;
    await this.getStatus(overrideCache);
  }

  async getStatus(overrideCache?: boolean) {
    console.log("side car set to isSidecarRunning", onChain.isSidecarRunning);

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
