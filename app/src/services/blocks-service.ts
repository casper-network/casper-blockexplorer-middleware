import { CasperServiceByJsonRPC } from "casper-js-sdk";
import NodeCache from "node-cache";
import { jsonRpc } from "../routes/on-chain";
import { CacheService } from "./cache-service";

// TODO: probably don't need to extend CacheService...
class BlocksService extends CacheService {
  // TODO: maybe we could actually use a new Map() here??
  // Since we'll actually be managing the cache ourselves, instead of using stdTTL
  // We could probably use a Map to create the cache service?
  // But maybe not, since node-cache provides a simple cleanup

  // TODO: also need to think about managing the cache limit of 1M keys
  // -> since either way it'll just be a JS object under the hood
  // could consider making a duplicate cache if the original gets close to 1M

  // TODO: also should consider a cron service that actually just fetches the latest block on a timer
  // this way we won't actually have to ever fetch the latest block async
  // because once the cache fetches the latest block, it will just add to the cache

  private cache: NodeCache;
  constructor(private readonly rpcClient: CasperServiceByJsonRPC) {
    super();
    this.cache = new NodeCache({ checkperiod: 0 });
  }
}

export const blocksService = new BlocksService(jsonRpc);
