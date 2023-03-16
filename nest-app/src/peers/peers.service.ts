import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";

@Injectable()
export class PeersService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}
}
