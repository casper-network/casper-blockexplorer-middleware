import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Cache } from "cache-manager";
import { CasperServiceByJsonRPC, GetStatusResult } from "casper-js-sdk";
import { GatewayService } from "src/gateway/gateway.service";
import { jsonRpc } from "src/main";
import { Peer, PeersWithAliveStatus } from "src/types/api";

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

  @Cron("*/1 * * * *", { name: "fetchPeersCron" })
  async handleCron() {
    await this.fetchPeersRpc();

    const peers = await this.getPeers();

    this.gateway.handleEvent("peers", {
      peers,
    });
  }

  @Cron("*/5 * * * *", { name: "peersAliveSchedule" })
  async handlePeersAliveCron() {
    const cachedPeers = await this.cacheManager.get<Peer[]>("peers");

    if (cachedPeers?.length) {
      console.log("*** called from cron ***");

      await this.checkArePeersAlive(cachedPeers);
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

    await this.checkArePeersAlive(cachedPeers);

    return {
      paginatedResult: this.paginatePeers(cachedPeers, count, pageNum),
      totalPeers: cachedPeers.length,
    };
  }

  async checkPeersInCache(peers: Peer[]): Promise<Peer[]> {
    const cachedPeers = await this.cacheManager.get<Peer[]>("peers");

    console.log("is cachedPeers", !!cachedPeers);

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

  addStatusToPeer(peer: Peer, status: GetStatusResult): Peer {
    // TODO: need to figure out what is added to Peer here:
    // stateRootHash && timestamp
    // OR
    // lastBlockHash && uptime

    return {} as Peer;
  }

  async checkArePeersAlive(peers: Peer[]): Promise<PeersWithAliveStatus[]> {
    console.log("being called again");

    // http://3.136.227.9:7777/rpc
    // 65.109.17.120:35000

    const peersWithAliveStatus = [];

    for (const peer of peers) {
      const nodeUrl = `http://${peer.address.split(":")[0]}:7777/rpc`;
      const peerJsonRpc = new CasperServiceByJsonRPC(nodeUrl);

      peerJsonRpc
        .getStatus()
        .then((status) => {
          console.log("completed", peers.indexOf(peer));
          // TODO: probably want to call a class method here to process and add to peers cache

          console.log({ status });

          this.addStatusToPeer(peer, status);
        })
        .catch((error) => {
          console.log("has error", peers.indexOf(peer));
        });
    }
    console.log({ peersWithAliveStatus });

    return [];
  }
}
