import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
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
    console.log("Websocket gateway initialized.");
  }

  handleConnection(client: Socket) {
    const sockets = this.io.sockets;

    console.log("WS client with id: ", client.id);
    console.log("Number of connected sockets: ", sockets.size);
  }

  handleEvent(event: string, ...args: any[]) {
    this.io.emit(event, JSON.stringify(args));
  }

  handleDisconnect(client: Socket) {
    console.log(`Websocket gateway disconnected from. ${client.id}`);
  }
}
