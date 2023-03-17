import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { jsonRpc } from "src/blocks/blocks.service";
import { Peer } from "src/types/peers";
import { Cache } from "cache-manager";
import { Cron } from "@nestjs/schedule";

// TODO: figure out method types (protected, private, public, etc.)
@Injectable()
export class PeersService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  isFetchingPeers = false;

  async onModuleInit() {
    console.log("on init peers service");
    await this.getPeers();
  }

  // every two minutes
  @Cron(`*/2 * * * *`)
  async handleCron() {
    if (!this.isFetchingPeers) {
      console.log("fetch peers in cron");
      const overrideCache = true;
      await this.getPeers(undefined, undefined, overrideCache);
    }
  }

  async getPeers(count?: number, pageNum?: number, overrideCache?: boolean) {
    const cachedPeers = await this.cacheManager.get<Peer[]>("peers");

    if (cachedPeers && !overrideCache) {
      return {
        paginatedResult: this.paginatePeers(cachedPeers, count, pageNum),
        totalPeers: cachedPeers.length,
      };
    }

    // TODO: better way to do this?
    this.isFetchingPeers = true;
    const { peers } = await jsonRpc.getPeers();
    this.isFetchingPeers = false;

    const peersTransformed: Peer[] = peers.map((peer) => {
      const { node_id: nodeId, address } = peer;
      return { nodeId, address };
    });

    await this.cacheManager.set("peers", peersTransformed);

    return {
      paginatedResult: this.paginatePeers(peersTransformed, count, pageNum),
      totalPeers: peersTransformed.length,
    };
  }

  paginatePeers = (peers: Peer[], count?: number, pageSize?: number) => {
    let paginatedPeers: Peer[];

    if (count && pageSize) {
      paginatedPeers = peers.slice((pageSize - 1) * count, pageSize * count);
    }

    return paginatedPeers;
  };
}
