import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Cache } from "cache-manager";
import { GatewayService } from "src/gateway/gateway.service";
import { jsonRpc } from "src/main";
import { Peer } from "src/types/api";

@Injectable()
export class PeersService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(GatewayService) private readonly gateway: GatewayService
  ) {}

  isFetchingPeers = false;

  async onModuleInit() {
    await this.fetchPeersRpc();
  }

  @Cron("*/2 * * * *")
  async handleCron() {
    await this.fetchPeersRpc();

    const peers = await this.getPeers();

    this.gateway.handleEvent("peers", {
      peers,
    });
  }

  async fetchPeersRpc() {
    if (this.isFetchingPeers) {
      return;
    }

    this.isFetchingPeers = true;
    const { peers } = await jsonRpc.getPeers();
    this.isFetchingPeers = false;

    const peersTransformed: Peer[] = peers.map((peer) => {
      const { node_id: nodeId, address } = peer;
      return { nodeId, address };
    });

    await this.cacheManager.set("peers", peersTransformed);
  }

  async getPeers(count?: number, pageNum?: number) {
    let cachedPeers = await this.cacheManager.get<Peer[]>("peers");

    if (!cachedPeers || !cachedPeers.length) {
      await this.fetchPeersRpc();
      cachedPeers = await this.cacheManager.get<Peer[]>("peers");
    }

    return {
      paginatedResult: this.paginatePeers(cachedPeers, count, pageNum),
      totalPeers: cachedPeers.length,
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
