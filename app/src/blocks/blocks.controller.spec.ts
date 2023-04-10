import { Test, TestingModule } from "@nestjs/testing";
import { Block } from "src/types/api";
import { BlocksController } from "./blocks.controller";
import { BlocksService } from "./blocks.service";

jest.mock("./blocks.service");

describe("BlocksController", () => {
  let blocksController: BlocksController;
  let blocksService: BlocksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [BlocksController],
      providers: [BlocksService],
    }).compile();

    blocksController = module.get(BlocksController);
    blocksService = module.get(BlocksService);
    jest.clearAllMocks();
  });

  describe("getBlocks", () => {
    let blocks: {
      blocks: Block[];
      total: number;
      updated: string | number;
    };

    beforeEach(async () => {
      blocks = await blocksService.getBlocks();
    });
  });
});
