import { Peer } from "../types";

export const paginatePeers = (
  peers: Peer[],
  count?: number,
  pageSize?: number
) => {
  let paginatedPeers;

  if (count && pageSize) {
    paginatedPeers = peers.slice((pageSize - 1) * count, pageSize * count);
  }

  return paginatedPeers;
};
