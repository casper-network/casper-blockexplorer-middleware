import { CasperServiceByJsonRPC } from "casper-js-sdk";

// Using our stable node
export const jsonRpc = new CasperServiceByJsonRPC(
  `https://rpc.mainnet.casperlabs.io/rpc`
);

export interface Block {
  hash: string;
  header: Header;
  body: Body;
  proofs: Proof[];
}

export interface Proof {
  public_key: string;
  signature: string;
}

export interface Body {
  proposer: string;
  deploy_hashes: string[];
  transfer_hashes: string[];
}

export interface Header {
  parent_hash: string;
  state_root_hash: string;
  body_hash: string;
  random_bit: boolean;
  accumulated_seed: string;
  era_end: null;
  timestamp: string;
  era_id: number;
  height: number;
  protocol_version: string;
}

export class BlocksService {
  async getLatestBlock() {
    const { block } = await jsonRpc.getLatestBlockInfo();

    return block;
  }

  async getBlockByHeight(height: number) {
    const { block } = await jsonRpc.getBlockInfoByHeight(height);

    // if (!block) throw new ApiError(StatusCodes.NOT_FOUND, "Not found block");

    // this.checkFlushCache();
    // this.cache.set(height, block);

    return block as unknown as Block;
  }

  async getBlocks(count = 10, orderByHeight = "desc", pageNum = 1) {
    const latestBlock = await this.getLatestBlock();

    const latestBlockHeight = latestBlock.header.height;

    const firstBlockOfPage = (pageNum - 1) * count;

    const fromBlock =
      orderByHeight === "desc"
        ? latestBlockHeight - firstBlockOfPage
        : firstBlockOfPage;

    let targetBlock =
      orderByHeight === "desc" ? fromBlock - count : fromBlock + count;

    if (targetBlock < 0) {
      targetBlock = 0;
    }

    if (targetBlock > latestBlockHeight) {
      targetBlock = latestBlockHeight;
    }

    const blockPromises: Promise<Block>[] = [];

    for (
      let i = fromBlock;
      orderByHeight === "desc" ? i >= targetBlock : i < targetBlock;
      orderByHeight === "desc" ? i-- : i++
    ) {
      try {
        const block = this.getBlockByHeight(i);
        if (blockPromises.length === count) {
          break;
        }
        blockPromises.push(block);
      } catch (error) {
        console.log("ERROR", error);
        break;
      }
    }

    const blocks = await Promise.all(blockPromises);

    const total = latestBlockHeight + 1;

    return { blocks, total, updated: latestBlock.header.timestamp };
  }
}
