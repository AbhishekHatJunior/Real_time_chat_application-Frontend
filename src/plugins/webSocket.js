import {io} from "socket.io-client"

export function webSocket(){
    return io("http://localhost:3000")
}