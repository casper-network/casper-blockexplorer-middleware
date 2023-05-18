import { OnModuleInit } from "@nestjs/common";
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from "@nestjs/websockets";
import { Namespace, Socket } from "socket.io";

@WebSocketGateway({
  namespace: "gateway",
  cors: {
    origin: "*",
  },
})
export class MyGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  io: Namespace;

  afterInit(): void {
    console.log("Websocket gateway initialized.");
  }

  handleConnection(client: Socket, ...args: any[]) {
    const sockets = this.io.sockets;

    console.log("WS client with id: ", client.id);
    console.log("Number of connected sockets: ", sockets.size);

    this.io.to(client.id).emit("test_message", "this is a test message");
  }

  handleDisconnect(client: Socket) {
    console.log("Websocket gateway disconnect.");
  }
}
