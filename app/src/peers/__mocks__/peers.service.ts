import { getPeersStub } from "../stubs/peers.stub";

export const PeersService = jest.fn().mockReturnValue({
  getPeers: jest.fn().mockReturnValue(getPeersStub()),
});
