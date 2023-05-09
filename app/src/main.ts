import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { CasperServiceByJsonRPC } from "casper-js-sdk";

import { AppModule } from "./app.module";
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

// TODO: replace 3.136.227.9 with nodeManager.getActiveNode().url
// and then append 18888 to be used here as the sidecar port
export const sidecar = new Sidecar("http://3.136.227.9:18888");

export const onChain = new OnChain(jsonRpc, sidecar);
