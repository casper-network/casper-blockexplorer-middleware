import {
  CacheTTL,
  CACHE_MANAGER,
  Inject,
  Injectable,
  OnModuleInit,
} from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Cache } from "cache-manager";

// @Injectable()
export class ValidatorsService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async onModuleInit() {
    console.log("init ValidatorsService");
  }
}
