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
      account = accountsService.getAccount("test");
    });

    it("should be called with hashOrPublicKey", () => {
      expect(accountsService.getAccount).toHaveBeenCalledWith("test");
    });

    it("should return account", () => {
      expect(account).toEqual({ something: "test here" });
    });
  });
});
