export const AccountsService = jest.fn().mockReturnValue({
  // TODO: put mock return value in stub
  getAccount: jest.fn().mockReturnValue({
    _accountHash:
      "account-hash-e386a6e2d67ab4c7af524f0b7f60fa77fe420a189309b613f359ccd83c27807a",
    namedKeys: [],
    mainPurse:
      "uref-7e38074b9fe8435ddd12ad892a3a06ecedc0cd71194fa35d061726e21743865b-007",
    associatedKeys: [],
    actionThresholds: { deployment: 1, keyManagement: 1 },
  }),
});
