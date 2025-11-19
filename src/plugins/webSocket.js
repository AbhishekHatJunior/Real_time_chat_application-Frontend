import { io } from "socket.io-client";

export function webSocket() {
  const serverUrl = "https://real-time-chat-application-backend-1.onrender.com"
  return io(serverUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });
}