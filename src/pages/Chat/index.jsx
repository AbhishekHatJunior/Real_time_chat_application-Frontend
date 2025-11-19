import { useState, useEffect, useRef } from "react";
import { webSocket } from "../../plugins/webSocket";
import toast, { Toaster } from 'react-hot-toast';

export default function Chat() {
    const [userName, setUserName] = useState("");
    const [chatTxt, setChatTxt] = useState("");
    const [showInput, setShowInput] = useState(true);
    const socket = useRef(null);
    const [mssg, setMssg] = useState([]);
    const chatInputRef = useRef();
    const rooms = ["general-chat", "tech-talk", "study-group"];
    const [enterChat, setEnterChat] = useState(false);
    const [startChat, setStartChat] = useState(false);
    const [currRoom, setCurrRoom] = useState("");
    const [availableUsers, setAvailableUsers] = useState([]);
    
  useEffect(() => {
    socket.current = webSocket();

    socket.current.on("connect", () => {
        socket.current.on("roomNotice", (roomMember) => {
            setAvailableUsers((prev) => [...prev, roomMember]);
            // toast(`${userName} has joined the chat!`, {icon: "👨‍🎓"});
            toast((t) => (
                <span>
                    <span className="me-1">👨‍🎓</span>
                    <b>{roomMember}</b> has joined the chat!
                    <span onClick={() => toast.dismiss(t.id)}>
                    <b className="ms-3">X</b> 
                    </span>
                </span>
                ));
            console.log(`${userName} has joined the chat.`);
        })
        
        socket.current.on("chatmssg", (mssg) => {
            setMssg((prev) => [...prev, mssg])
        })
    })

  });

    const handleEnterChat = (e) => {
    e.preventDefault();
    setEnterChat(true);
    setShowInput(false);
  }

  const handleSend = (room) => {
    // e.preventDefault();
    // setShowInput(false);
    setCurrRoom(room)
    setEnterChat(false);
    setStartChat(true)

    socket.current.emit("joinRoom", userName, room);
  };


  const handleChat = (e) => {
    e.preventDefault();
    const mssg = {
        id: Date.now(),
        text: chatTxt,
        ts: Date.now(),
        chatUser: userName
    }

    // setMssg((prev) => [...prev, mssg])
    setChatTxt("")
    chatInputRef.current.focus();
    console.log("current room is:", currRoom);

    socket.current.emit("chatMssg", mssg, currRoom)
  }

  return (
    <div className="chat-container itemsPosition">
        <Toaster/>
      <div>
        {showInput && (
          <form action="" onSubmit={handleEnterChat}>
            <div>
              <div className="mb-5">
                <h1>Welcome to RedChat!</h1>
              </div>

              <div className="mb-3">
                Enter your Username to get started: 
              </div>

              <div className="d-flex flex-column gap-3">
              <div>
                <input
                  type="text"
                  value={userName}
                  id="userName"
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>

              <div>
                <button type="submit">Enter Chat</button>
              </div>
              </div>
            </div>
          </form>
        )}

        {enterChat && (
          <div>
            {rooms.map((room, index) => (
              <div onClick={() => handleSend(room)} key={room} className="border-5 shadow pt-2 rooms-div">
                <div className="mb-4">{room}</div>
              </div>
            ))}
          </div>
        )}

        {startChat && (
          <div className="chat-display-container">
              <div>
                  <h2 className="mb-5">Welcome, to the <span className="room">"{currRoom}"</span> room <span className="username">{userName}!</span></h2>

                  <div className="mb-4">
                      {mssg.length !== 0 ? (
                          <div>
                              {mssg.map((item) => (
                          <div key={item.id} className={`d-flex justify-content-${item.chatUser === userName ? "end" : "start"} mb-3`}>
                              <div className={`p-2 rounded-3 ${item.chatUser === userName ? "right-chat-box" : "left-chat-box"}`}>{item.text}</div>
                          </div>
                      ))}
                          </div>
                      ) : (
                          <div>
                              <div>No chats yet..</div>
                              <div>Start your conversation!</div>
                          </div>
                      )}
                      
                  </div>

                  <form action="" onSubmit={handleChat}>
                      <div className="mb-3">
                          <input ref={chatInputRef} type="text" value={chatTxt} id="chatTxt" onChange={(e) => setChatTxt(e.target.value)} required />
                      </div>

                      <div>
                          <button type="submit">Send</button>
                      </div>
                  </form>
              </div>

              <div className="bg-">
                <h3 className="mb-4">Users Online</h3>
                <div>
                  <div className="mb-2">👤 {userName} (You)</div>
                  {availableUsers.map((user, index) => (
                    <div key={index} className="mb-2">
                      <span className="me-2">👤 {user}</span> 
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}
      </div>
    </div>
  );
}
