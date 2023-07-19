import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Cache } from "cache-manager";
import { CasperServiceByJsonRPC, GetStatusResult } from "casper-js-sdk";
import { GatewayService } from "src/gateway/gateway.service";
import { jsonRpc } from "src/main";
import { Peer, PeersWithAliveStatus } from "src/types/api";
import { promiseWithTimeout } from "src/utils/promise";

@Injectable()
export class PeersService {
  readonly logger = new Logger(PeersService.name);
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(GatewayService) private readonly gateway: GatewayService
  ) {}

  isFetchingPeers = false;

  async onModuleInit() {
    await this.fetchPeersRpc();

    await this.handlePeersAliveCron();
  }

  @Cron("*/2 * * * *", { name: "fetchPeersCron" })
  async handleCron() {
    await this.fetchPeersRpc();

    const peers = await this.getPeers();

    this.gateway.handleEvent("peers", {
      peers,
    });
  }

  @Cron("*/5 * * * *", { name: "peersAliveSchedule" })
  async handlePeersAliveCron() {
    console.log("called in here");

    const cachedPeers = await this.cacheManager.get<Peer[]>("peers");

    if (cachedPeers?.length) {
      await this.checkAndAddStatusToPeers(cachedPeers);
    }
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

    const combinedPeers = await this.checkPeersInCache(peersTransformed);

    await this.cacheManager.set("peers", combinedPeers);
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

  async checkPeersInCache(peers: Peer[]): Promise<Peer[]> {
    const cachedPeers = await this.cacheManager.get<Peer[]>("peers");

    if (!cachedPeers?.length) {
      return peers;
    }

    const combinedPeers = peers.map((peer) => {
      const peerInCache = cachedPeers.find(
        (cachedPeer) =>
          cachedPeer.address === peer.address &&
          cachedPeer.nodeId === peer.nodeId
      );

      if (peerInCache) {
        return peerInCache;
      }

      return peer;
    });

    return combinedPeers;
  }

  paginatePeers = (peers: Peer[], count?: number, pageSize?: number) => {
    let paginatedPeers: Peer[];

    if (count && pageSize) {
      paginatedPeers = peers.slice((pageSize - 1) * count, pageSize * count);
    }

    return paginatedPeers;
  };

  async addStatusToPeer(
    peer: PeersWithAliveStatus,
    status: GetStatusResult & { uptime: string }
  ) {
    const lastAddedBlockHash = status.last_added_block_info?.hash;
    const uptime = status.uptime;

    const peerWithAliveStatus = { ...peer, uptime, lastAddedBlockHash };

    const cachedPeers = await this.cacheManager.get<PeersWithAliveStatus[]>(
      "peers"
    );

    if (!cachedPeers?.length) {
      return;
    }

    const updatedPeers = cachedPeers.map((cachedPeer) => {
      if (
        cachedPeer.address === peerWithAliveStatus.address &&
        cachedPeer.nodeId === peerWithAliveStatus.nodeId
      ) {
        return peerWithAliveStatus;
      }

      return cachedPeer;
    });

    await this.cacheManager.set("peers", updatedPeers);
  }

  async checkAndAddStatusToPeers(peers: PeersWithAliveStatus[]) {
    for (const peer of peers) {
      const nodeUrl = `http://${peer.address.split(":")[0]}:7777/rpc`;
      const peerJsonRpc = new CasperServiceByJsonRPC(nodeUrl);

      // it looks like CasperServiceByJsonRPC has a max timeout of 75000 ms
      // so any response longer than this will automatically timeout and be caught
      promiseWithTimeout(75000, peerJsonRpc.getStatus())
        .then((status: GetStatusResult & { uptime: string }) => {
          this.addStatusToPeer(peer, status);
          console.log({ status });
        })
        .catch((err) => {
          this.logger.error("Error fetching status for peer:", [err, peer]);
        });
    }
  }
}
