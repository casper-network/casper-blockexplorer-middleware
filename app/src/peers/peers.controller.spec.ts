import { Test, TestingModule } from "@nestjs/testing";
import { PeersController } from "./peers.controller";
import { PeersService } from "./peers.service";
import { getPeersStub } from "./stubs/peers.stub";

jest.mock("./peers.service");

describe("PeersController", () => {
  let peersController: PeersController;
  let peersService: PeersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [PeersController],
      providers: [PeersService],
    }).compile();

    peersController = module.get(PeersController);
    peersService = module.get(PeersService);
    jest.clearAllMocks();
  });

  describe("getPeers", () => {
    it("shold return peers", async () => {
      const peers = await peersService.getPeers();
      expect(peers).toEqual(getPeersStub());
    });
  });
});
