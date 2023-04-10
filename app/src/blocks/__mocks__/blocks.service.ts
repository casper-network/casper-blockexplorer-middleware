import { getBlocksStub } from "../stubs/blocks.stub";

export const BlocksService = jest.fn().mockReturnValue({
  getBlocks: jest.fn().mockReturnValue(getBlocksStub()),
});
