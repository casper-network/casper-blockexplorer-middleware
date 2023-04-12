import { Test, TestingModule } from "@nestjs/testing";
import {
  getCurrentEraValidatorsStub,
  getCurrentEraValidatorStatusStub,
} from "./stubs/validators.stub";
import { ValidatorsController } from "./validators.controller";
import { ValidatorsService } from "./validators.service";

jest.mock("./validators.service");

describe("PeersController", () => {
  let validatorsController: ValidatorsController;
  let validatorsService: ValidatorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [ValidatorsController],
      providers: [ValidatorsService],
    }).compile();

    validatorsController = module.get(ValidatorsController);
    validatorsService = module.get(ValidatorsService);
    jest.clearAllMocks();
  });

  describe("getCurrentEraValidators", () => {
    it("shold return current era validators", async () => {
      const currentEraValidators =
        await validatorsService.getCurrentEraValidators();
      expect(currentEraValidators).toEqual(getCurrentEraValidatorsStub());
    });
  });

  describe("getCurrentEraValidatorsStatus", () => {
    it("should return current era validators status", async () => {
      const currentEraValidatorsStatus =
        await validatorsService.getCurrentEraValidatorStatus();

      expect(currentEraValidatorsStatus).toEqual(
        getCurrentEraValidatorStatusStub()
      );
    });
  });
});
