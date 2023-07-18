export const getDeployStub = () => ({
  timestamp: "2023-04-05T18:17:14.049Z",
  dateTime: "2023-04-05T18:17:14.049Z",
  deployHash:
    "8cac05b31f7f474f828a2dabdaf0be2fe85085b5cc472db354468e39fa68ec53",
  blockHash: "436c5fceb279444608baba8bc1634b45d21110840ef37d50baa1873e593c064b",
  publicKey:
    "0197565a21eda48501efcc16bc20b5013ef6ce80f3b027e4f95ddef57474a6c557",
  action: "revoke_bid",
  deployType: "StoredContractByHash",
  amount: undefined,
  paymentAmount: "10000000000",
  cost: "5794181780",
  status: "Success",
  rawDeploy: "",
});

export const getSidecarDeploysStub = () => [
  {
    deploy_hash:
      "3b0fddb3ed65ddf076892dddbcb98694921e74ea90d33137121a58985859ddcf",
    deploy_accepted: {
      hash: "3b0fddb3ed65ddf076892dddbcb98694921e74ea90d33137121a58985859ddcf",
      header: {},
      payment: {},
      session: {},
      approvals: [],
    },
    deploy_processed: {
      deploy_hash:
        "3b0fddb3ed65ddf076892dddbcb98694921e74ea90d33137121a58985859ddcf",
      account:
        "0202ed20f3a93b5386bc41b6945722b2bd4250c48f5fa0632adf546e2f3ff6f4ddee",
      timestamp: "2023-06-15T22:13:16.579Z",
      ttl: "30m",
      dependencies: [],
      block_hash:
        "92d9b84db79132a77f76216c7d81b2243fe92ef26db885ae0d64ee585e4799fa",
      execution_result: [Object],
    },
    deploy_expired: false,
    block_timestamp: "2023-06-15T22:14:07.104Z",
  },
];
