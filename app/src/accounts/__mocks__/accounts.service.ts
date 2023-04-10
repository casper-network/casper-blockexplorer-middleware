export const AccountsService = jest.fn().mockReturnValue({
  getAccount: jest.fn().mockReturnValue({ something: "test here" }),
});
