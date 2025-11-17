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
    
  useEffect(() => {
    socket.current = webSocket();

    socket.current.on("connect", () => {
        socket.current.on("roomNotice", (userName) => {
            // toast(`${userName} has joined the chat!`, {icon: "👨‍🎓"});
            toast((t) => (
                <span>
                    <span className="me-1">👨‍🎓</span>
                    <b>{userName}</b> has joined the chat!
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

  const handleSend = (e) => {
    e.preventDefault();
    setShowInput(false);

    socket.current.emit("joinRoom", userName);
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

    socket.current.emit("chatMssg", mssg)
  }

  return (
    <div className="chat-container itemsPosition">
        <Toaster/>
      <div>
        {showInput && (
          <form action="" onSubmit={handleSend}>
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

        {!showInput && (
            <div>
                <h2 className="mb-5">Welcome, {userName}!</h2>

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
            )}
      </div>
    </div>
  );
}
