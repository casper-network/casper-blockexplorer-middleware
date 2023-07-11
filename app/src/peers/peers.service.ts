import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Cache } from "cache-manager";
import { CasperServiceByJsonRPC, GetStatusResult } from "casper-js-sdk";
import { setTimeout } from "timers/promises";
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

    // TODO: will want to get peers from cache first
    // loop over this
    // if peer from cache exists in fetched peers list, update with only nodeId and address (or maybe pass over??)
    // if not exists, then add to list
    // and then add list back to cache
    // -> this will prevent us from overriding peers that already have an 'alive' status added
    // since the alive status might take some time to add

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

  // TODO: probably want to make sure this isn't part of a cron job
  // since fetching some of the peers will create a big delay
  // --> need to figure out how to deal with this
  async checkArePeersAlive(peers: Peer[]): Promise<PeersWithAliveStatus[]> {
    console.log("being called again");

    // http://3.136.227.9:7777/rpc
    // 65.109.17.120:35000

    const peersWithAliveStatus = [];

    for (const peer of peers) {
      const nodeUrl = `http://${peer.address.split(":")[0]}:7777/rpc`;
      const peerJsonRpc = new CasperServiceByJsonRPC(nodeUrl);

      // console.log({ nodeUrl });

      // try {
      //   const status = await peerJsonRpc.getStatus();

      //   console.log({ status });

      //   peersWithAliveStatus.push(status.last_added_block_info.hash);
      // } catch (e) {
      //   console.log("error!!!", e);
      //   continue;
      // }

      peerJsonRpc
        .getStatus()
        .then((status) => {
          console.log("completed", peers.indexOf(peer));
          // TODO: probably want to call a class method here to process and add to peers cache
        })
        .catch((error) => {
          console.log("has error", peers.indexOf(peer));
        });
    }
    console.log({ peersWithAliveStatus });

    return [];
  }
}

/*

{
  peersTransformed: { nodeId: 'tls:00eb..ac11', address: '65.109.17.120:35000' }
}
{
  e: JSONRPCError: request to http://65.109.17.120:35000/rpc failed, reason: read ECONNRESET
      at new JSONRPCError (/Users/matthewgibson/casper-blockexplorer-middleware/app/node_modules/@open-rpc/client-js/build/Error.js:24:28)
      at HTTPTransport.<anonymous> (/Users/matthewgibson/casper-blockexplorer-middleware/app/node_modules/@open-rpc/client-js/build/transports/HTTPTransport.js:122:39)
      at step (/Users/matthewgibson/casper-blockexplorer-middleware/app/node_modules/@open-rpc/client-js/build/transports/HTTPTransport.js:46:23)
      at Object.throw (/Users/matthewgibson/casper-blockexplorer-middleware/app/node_modules/@open-rpc/client-js/build/transports/HTTPTransport.js:27:53)
      at rejected (/Users/matthewgibson/casper-blockexplorer-middleware/app/node_modules/@open-rpc/client-js/build/transports/HTTPTransport.js:19:65)
      at processTicksAndRejections (node:internal/process/task_queues:96:5) {
    code: 7979,
    data: FetchError: request to http://65.109.17.120:35000/rpc failed, reason: read ECONNRESET
        at ClientRequest.<anonymous> (/Users/matthewgibson/casper-blockexplorer-middleware/app/node_modules/node-fetch/lib/index.js:1505:11)
        at ClientRequest.emit (node:events:513:28)
        at Socket.socketErrorListener (node:_http_client:494:9)
        at Socket.emit (node:events:513:28)
        at emitErrorNT (node:internal/streams/destroy:157:8)
        at emitErrorCloseNT (node:internal/streams/destroy:122:3)
        at processTicksAndRejections (node:internal/process/task_queues:83:21) {
      type: 'system',
      errno: 'ECONNRESET',
      code: 'ECONNRESET'
    }
  }
}

*/
