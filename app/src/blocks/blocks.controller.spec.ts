import { Test } from "@nestjs/testing";
import { CacheModule, CACHE_MANAGER } from "@nestjs/common";
import { NODE_CACHE_LIMIT } from "src/config";
import { BlocksController } from "./blocks.controller";
import { BlocksService } from "./blocks.service";

describe("BlocksController", () => {
  let blocksService: BlocksService;
  let blocksController: BlocksController;

  beforeEach(async () => {
    // TODO: move above this?
    const moduleRef = await Test.createTestingModule({
      imports: [
        CacheModule.register({ ttl: Number.MAX_VALUE, max: NODE_CACHE_LIMIT }),
      ],
      controllers: [BlocksController],
      providers: [BlocksService],
      exports: [BlocksService],
    }).compile();

    blocksService = moduleRef.get<BlocksService>(BlocksService);
    blocksController = moduleRef.get<BlocksController>(BlocksController);
  });

  describe("getBlocks", () => {});
});
