import { Test, TestingModule } from "@nestjs/testing";

import { AccountsController } from "./accounts.controller";
import { AccountsService } from "./accounts.service";
import {
  balanceStub,
  balanceUref,
  getAccountStub,
} from "./stubs/accounts.stub";

jest.mock("./accounts.service");

describe("AccountsController", () => {
  let accountsService: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [AccountsController],
      providers: [AccountsService],
    }).compile();

    accountsService = module.get(AccountsService);
    jest.clearAllMocks();
  });

  describe("getAccount", () => {
    let account;

    beforeEach(async () => {
      account = await accountsService.getAccount(getAccountStub()._accountHash);
    });

    it("should be called with hashOrPublicKey", () => {
      expect(accountsService.getAccount).toHaveBeenCalledWith(
        getAccountStub()._accountHash
      );
    });

    it("should return account", () => {
      expect(account).toEqual(getAccountStub());
    });
  });

  describe("getBalamce", () => {
    let balance: string;

    beforeEach(async () => {
      balance = await accountsService.getBalance(balanceUref);
    });

    it("should be called with uref", () => {
      expect(accountsService.getBalance).toHaveBeenCalledWith(balanceUref);
    });

    it("should return account balance", () => {
      expect(balance).toEqual(balanceStub);
    });
  });
});
