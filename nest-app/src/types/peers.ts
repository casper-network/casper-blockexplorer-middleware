export interface Peer {
  nodeId: string;
  address: string;
  isAlive?: boolean | null;
  uptime?: string | null;
  lastAddedBlockHash?: string | null;
}
