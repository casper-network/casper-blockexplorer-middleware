export const getBlockStub = () => ({
  hash: "7b4a329c4344bc90d2d46d7e0d44507ad1e8ec7d79477cea3f132a06009c5eca",
  header: {
    parent_hash:
      "85778c983fdfdcb862fa058b6bee693b24bd11e331f05745e48c1ebf36cc2c33",
    state_root_hash:
      "fce53d45d1c2dd79ffd08fff922962244bafdc78b4be51ab2a3469cfb856465a",
    body_hash:
      "d8f85150893af03a54631b51df7892e694f4b7c08723079ab00d87c7bafeef2b",
    random_bit: true,
    accumulated_seed:
      "b8ae3a0c7d8deed3091e2e1401d07dba098a38c33e5bb6ecd65efa1373a33a98",
    era_end: null,
    timestamp: "2023-04-05T18:15:28.512Z",
    era_id: 8805,
    height: 1633020,
    protocol_version: "1.4.13",
  },
  body: {
    proposer:
      "01000e6fce753895c0d08d5d6af62db4e9b0d070f10e69e2c6badf977b29bbeeee",
    deploy_hashes: [],
    transfer_hashes: [],
  },
  proofs: [],
});

export const getBlocksStub = () => ({
  blocks: [getBlockStub()],
  total: 1646660,
  updated: "2023-04-10T23:13:53.152Z",
});

export const getLatestBlockStub = () => getBlockStub();

export const getBlockByHeight = () => getBlockStub();
export const getBlockByHash = () => getBlockStub();
