import {io} from "socket.io-client"

export function webSocket(){
    return io("http://192.168.29.40:3000")
}