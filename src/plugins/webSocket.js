import { io } from "socket.io-client";

export function webSocket() {
  const serverUrl = import.meta.env.SERVER_URL
  return io(serverUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });
}