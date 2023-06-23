import { Logger } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";

@WebSocketGateway({
  namespace: "gateway",
  cors: {
    origin: "*",
  },
})
export class GatewayService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  io: Namespace;

  afterInit(): void {
    Logger.log("Websocket gateway initialized.");
  }

  handleConnection(client: Socket) {
    const sockets = this.io.sockets;

    Logger.log("WS client with id: ", client.id);
    Logger.log("Number of connected sockets: ", sockets.size);
  }

  handleEvent(event: string, ...args) {
    this.io.emit(event, JSON.stringify(args));
  }

  handleDisconnect(client: Socket) {
    Logger.warn(`Websocket gateway disconnected from. ${client.id}`);
  }
}
