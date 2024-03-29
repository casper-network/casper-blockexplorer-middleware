import { config } from "dotenv";

config();

const REQUIRED_ENVS = ["NODE_URLS"];

export const NODE_ENV = process.env.NODE_ENV || "production";

if (NODE_ENV !== "test") {
  REQUIRED_ENVS.forEach((requiredEnv) => {
    if (!Object.keys(process.env).includes(requiredEnv))
      throw Error(`Missing ${requiredEnv} env variable`);
  });
}

export const BLOCK_GENERATE_INTERVAL = 30;
export const DEFAULT_PAGINATION_COUNT = 10;
export const NODE_CACHE_LIMIT = 2 ** 19; // 524,288
export const ERA_CHECK_PERIOD_MINUTES = 10;

export const PORT = process.env.PORT || 4000;
export const NODE_URLS = process.env.NODE_URLS;

export const SIDECAR_REST_URL = process.env.SIDECAR_REST_URL;
export const SIDECAR_EVENTSTREAM_URL = process.env.SIDECAR_EVENTSTREAM_URL;
export const SIDECAR_IS_RUNNING =
  SIDECAR_REST_URL !== undefined && SIDECAR_EVENTSTREAM_URL !== undefined;
export const PEERS_UPDATE_INTERVAL = process.env.PEERS_UPDATE_INTERVAL || 120;

export const COIN_GECKO_PUBLIC_API_URL = process.env.COIN_GECKO_PUBLIC_API_URL;
