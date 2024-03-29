import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { CasperServiceByJsonRPC } from "casper-js-sdk";

import { AppModule } from "./app.module";
import { CoinGecko } from "./coin-gecko";
import { COIN_GECKO_PUBLIC_API_URL, SIDECAR_REST_URL } from "./config";
import { nodeManager } from "./node-manager";
import { OnChain } from "./on-chain";
import { Sidecar } from "./sidecar";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(4000);
}
bootstrap();

export const jsonRpc = new CasperServiceByJsonRPC(
  nodeManager.getActiveNode().url
);

export const sidecar = new Sidecar(SIDECAR_REST_URL);
export const onChain = new OnChain(jsonRpc, sidecar);
export const coinGecko = new CoinGecko(COIN_GECKO_PUBLIC_API_URL);
