import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { CasperServiceByJsonRPC } from "casper-js-sdk";
import { AppModule } from "./app.module";
import { nodeManager } from "./node-manager";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(4000);
}
bootstrap();

export const jsonRpc = new CasperServiceByJsonRPC(
  nodeManager.getActiveNode().url
);
