import { CasperServiceByJsonRPC } from 'casper-js-sdk';

// Using our stable node
export const jsonRpc = new CasperServiceByJsonRPC(
  `http://localhost:${4000}/rpc`,
);

export class BlocksService {
  private latestBlock = 'this is the latest block';

  async getLatestBlock() {
    const jsonRpc = new CasperServiceByJsonRPC(
      `https://rpc.mainnet.casperlabs.io/rpc`,
    );

    const { block } = await jsonRpc.getLatestBlockInfo();

    return block;
  }
}
