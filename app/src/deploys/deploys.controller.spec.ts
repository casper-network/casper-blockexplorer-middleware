import { Test, TestingModule } from "@nestjs/testing";
import { GetDeploy } from "src/types/deploy";

import { DeploysController } from "./deploys.controller";
import { DeploysService } from "./deploys.service";
import { getDeployStub } from "./stubs/deploys.stub";

jest.mock("./deploys.service");

describe("DeploysController", () => {
  let deploysService: DeploysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [DeploysController],
      providers: [DeploysService],
    }).compile();

    deploysService = module.get(DeploysService);
    jest.clearAllMocks();
  });

  describe("getDeployByHash", () => {
    let deploy: GetDeploy;

    beforeEach(async () => {
      deploy = await deploysService.getDeploy(getDeployStub().deployHash);
    });

    it("should be called with hash", () => {
      expect(deploysService.getDeploy).toHaveBeenLastCalledWith(
        getDeployStub().deployHash
      );
    });

    it("should return deploy", () => {
      expect(deploy).toEqual(getDeployStub());
    });
  });
});
