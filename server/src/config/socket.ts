import type { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";

let io: SocketServer | null = null;

export const initSocket = (server: HttpServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN ?? "*",
      credentials: true
    }
  });

  io.on("connection", socket => {
    socket.emit("connected", { ok: true });
  });

  return io;
};

export const emitDataChange = (event: string, payload?: unknown) => {
  io?.emit(event, payload);
};
