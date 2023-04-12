import { Test, TestingModule } from "@nestjs/testing";
import { Block } from "src/types/api";

import { BlocksController } from "./blocks.controller";
import { BlocksService } from "./blocks.service";
import {
  getBlocksStub,
  getBlockStub,
  getLatestBlockStub,
} from "./stubs/blocks.stub";

jest.mock("./blocks.service");

describe("BlocksController", () => {
  let blocksService: BlocksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [BlocksController],
      providers: [BlocksService],
    }).compile();

    blocksService = module.get(BlocksService);
    jest.clearAllMocks();
  });

  describe("getBlocks", () => {
    it("should return blocks", async () => {
      const blocks = await blocksService.getBlocks();
      expect(blocks).toEqual(getBlocksStub());
    });
  });

  describe("getLatestBlock", () => {
    it("should return latestBlock", async () => {
      const latestBlock = await blocksService.getLatestBlock();
      expect(latestBlock).toEqual(getLatestBlockStub());
    });
  });

  describe("getBlockByHeight", () => {
    let blockByHeight: Block;

    beforeEach(async () => {
      blockByHeight = await blocksService.getBlockByHeight(
        getBlockStub().header.height
      );
    });

    it("should be called with height", () => {
      expect(blocksService.getBlockByHeight).toHaveBeenCalledWith(
        getBlockStub().header.height
      );
    });

    it("should return block", () => {
      expect(blockByHeight).toEqual(getBlockStub());
    });
  });

  describe("getBlockByHash", () => {
    let blockByHash: Block;

    beforeEach(async () => {
      blockByHash = await blocksService.getBlock(getBlockStub().hash);
    });

    it("should be called with hash", () => {
      expect(blocksService.getBlock).toHaveBeenCalledWith(getBlockStub().hash);
    });

    it("should return block", () => {
      expect(blockByHash).toEqual(getBlockStub());
    });
  });
});
