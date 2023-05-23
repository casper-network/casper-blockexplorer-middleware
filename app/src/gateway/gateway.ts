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

    // this.io.to(client.id).emit(
    //   "test_message",
    //   JSON.stringify({
    //     first: "this is the first property",
    //     second: false,
    //     third: 1000,
    //   })
    // );
  }

  handleEvent(event: string, ...args: any[]) {
    // TODO: figure out how to pass the clientID here like in handleConnection method
    // Or actually do we really care since we'll want to emit to all clients connected?
    // I should really figure out a way to test that we can emit to multiple clients at once
    console.log({ event });
    console.log({ args });

    this.io.emit(event, JSON.stringify(args));
  }

  handleDisconnect(client: Socket) {
    console.log("Websocket gateway disconnect.");
  }
}
