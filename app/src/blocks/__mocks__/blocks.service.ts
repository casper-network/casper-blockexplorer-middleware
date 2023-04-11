import {
  getBlockByHash,
  getBlockByHeight,
  getBlocksStub,
  getLatestBlockStub,
} from "../stubs/blocks.stub";

export const BlocksService = jest.fn().mockReturnValue({
  getBlocks: jest.fn().mockReturnValue(getBlocksStub()),
  getLatestBlock: jest.fn().mockReturnValue(getLatestBlockStub()),
  getBlockByHeight: jest.fn().mockReturnValue(getBlockByHeight()),
  getBlock: jest.fn().mockReturnValue(getBlockByHash()),
});
