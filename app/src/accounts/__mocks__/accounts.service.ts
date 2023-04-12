import { balanceStub, getAccountStub } from "../stubs/accounts.stub";

export const AccountsService = jest.fn().mockReturnValue({
  getAccount: jest.fn().mockReturnValue(getAccountStub()),
  getBalance: jest.fn().mockReturnValue(balanceStub),
});
