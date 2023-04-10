import { Test, TestingModule } from "@nestjs/testing";
import { AccountsController } from "./accounts.controller";
import { AccountsService } from "./accounts.service";

jest.mock("./accounts.service");

describe("AccountsController", () => {
  let accountsContoller: AccountsController;
  let accountsService: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [AccountsController],
      providers: [AccountsService],
    }).compile();

    accountsContoller = module.get(AccountsController);
    accountsService = module.get(AccountsService);
    jest.clearAllMocks();
  });

  describe("getAccount", () => {
    let account: any;

    beforeEach(() => {
      // TODO: put the hashOrPublicKey in stub
      account = accountsService.getAccount(
        "01000e6fce753895c0d08d5d6af62db4e9b0d070f10e69e2c6badf977b29bbeeee"
      );
    });

    it("should be called with hashOrPublicKey", () => {
      expect(accountsService.getAccount).toHaveBeenCalledWith(
        "01000e6fce753895c0d08d5d6af62db4e9b0d070f10e69e2c6badf977b29bbeeee"
      );
    });

    it("should return account", () => {
      expect(account).toEqual({
        _accountHash:
          "account-hash-e386a6e2d67ab4c7af524f0b7f60fa77fe420a189309b613f359ccd83c27807a",
        namedKeys: [],
        mainPurse:
          "uref-7e38074b9fe8435ddd12ad892a3a06ecedc0cd71194fa35d061726e21743865b-007",
        associatedKeys: [],
        actionThresholds: { deployment: 1, keyManagement: 1 },
      });
    });
  });
});
