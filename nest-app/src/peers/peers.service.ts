import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { jsonRpc } from "src/blocks/blocks.service";
import { Peer } from "src/types/peers";
import { Cache } from "cache-manager";

// TODO: figure out method types (protected, private, public, etc.)
@Injectable()
export class PeersService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async onModuleInit() {
    console.log("on init peers service");
  }

  // TODO: add caching - how often do we want to clear?
  // avoids 'Return type of public method from exported class has or is using name 'Peer' from external module' error
  async getPeers(count?: number, pageNum?: number): Promise<any> {
    const cachedPeers = await this.cacheManager.get<Peer[]>("peers");

    if (cachedPeers) {
      return {
        paginatedResult: this.paginatePeers(cachedPeers, count, pageNum),
        totalPeers: cachedPeers.length,
      };
    }

    const { peers } = await jsonRpc.getPeers();

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
