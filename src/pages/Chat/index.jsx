import { useState, useEffect, useRef } from "react";
import { webSocket } from "../../plugins/webSocket";
import toast, { Toaster } from 'react-hot-toast';
import UsTalkLogo from "../../assets/images/UsTalkLogo.png";
import { FaArrowLeftLong, FaPaperPlane, FaUsers, FaDoorOpen, FaSun, FaMoon } from "react-icons/fa6";
import { IoMdSend } from "react-icons/io";

export default function Chat() {
    const [userName, setUserName] = useState("");
    const [chatTxt, setChatTxt] = useState("");
    const [showInput, setShowInput] = useState(true);
    const socket = useRef(null);
    const [mssg, setMssg] = useState([]);
    const chatInputRef = useRef();
    const messagesEndRef = useRef(null);
    const rooms = ["general-chat", "tech-talk", "study-group"];
    const [enterChat, setEnterChat] = useState(false);
    const [startChat, setStartChat] = useState(false);
    const [currRoom, setCurrRoom] = useState("");
    const [availableUsers, setAvailableUsers] = useState([]);
    const [generalMssg, setGeneralMssg] = useState([]);
    const [techMssg, setTechMssg] = useState([]);
    const [studyMssg, setStudyMssg] = useState([]);
    const [isDarkTheme, setIsDarkTheme] = useState(true); // Default to dark theme
    
    // Scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [generalMssg, techMssg, studyMssg]);

    // Apply theme class to body
    useEffect(() => {
        if (isDarkTheme) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
    }, [isDarkTheme]);

    const toggleTheme = () => {
        setIsDarkTheme(!isDarkTheme);
    };

    useEffect(() => {
        socket.current = webSocket();

        const handleRoomNotice = (roomMember) => {
            if (userName !== roomMember) {
                setAvailableUsers((prev) => [...prev, roomMember]);
                toast.success(`${roomMember} has joined the chat!`);
            }
        };

        const handleChatMessage = (mssg, currRoom) => {
            if (mssg.chatUser !== userName) {
                if (currRoom === "general-chat") {
                    setGeneralMssg((prev) => [...prev, mssg]);
                } else if (currRoom === "tech-talk") {
                    setTechMssg((prev) => [...prev, mssg]);
                } else if (currRoom === "study-group") {
                    setStudyMssg((prev) => [...prev, mssg]);
                }
            }
        };

        socket.current.on("connect", () => {
            console.log("Connected to WebSocket");
        });

        socket.current.on("roomNotice", handleRoomNotice);
        socket.current.on("chatmssg", handleChatMessage);

        return () => {
            if (socket.current) {
                socket.current.off("roomNotice", handleRoomNotice);
                socket.current.off("chatmssg", handleChatMessage);
                socket.current.disconnect();
            }
        };
    }, [userName]);

    const handleEnterChat = (e) => {
        e.preventDefault();
        if (userName.trim()) {
            setEnterChat(true);
            setShowInput(false);
        }
    }

    const handleSend = (room) => {
        if (room === currRoom) {
            setEnterChat(false);
            setStartChat(true);
        } else {
            setCurrRoom(room);
            setEnterChat(false);
            setStartChat(true);
            socket.current.emit("joinRoom", userName, room);
        }
    };

    const handleViewRooms = () => {
        setEnterChat(true);
        setStartChat(false);
    }

    const handleChat = (e) => {
        e.preventDefault();
        if (!chatTxt.trim()) return;

        const mssg = {
            id: Date.now(),
            text: chatTxt,
            ts: Date.now(),
            chatUser: userName
        }

        // Add message to local state immediately
        // if (currRoom === "general-chat") {
        //     setGeneralMssg((prev) => [...prev, mssg]);
        // } else if (currRoom === "tech-talk") {
        //     setTechMssg((prev) => [...prev, mssg]);
        // } else if (currRoom === "study-group") {
        //     setStudyMssg((prev) => [...prev, mssg]);
        // }

        setChatTxt("");
        chatInputRef.current.focus();
        socket.current.emit("chatMssg", mssg, currRoom);
    }

    const getCurrentMessages = () => {
        if (currRoom === "general-chat") return generalMssg;
        if (currRoom === "tech-talk") return techMssg;
        if (currRoom === "study-group") return studyMssg;
        return [];
    };

    const formatRoomName = (room) => {
        return room.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="chat-app">
            <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: isDarkTheme ? '#363636' : '#ffffff',
                        color: isDarkTheme ? '#fff' : '#333',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    },
                }}
            />
            
            {/* Theme Toggle Button */}
            <button 
                className={`theme-toggle ${isDarkTheme ? 'dark' : 'light'}`}
                onClick={toggleTheme}
                aria-label={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
            >
                {isDarkTheme ? <FaSun className="theme-icon" /> : <FaMoon className="theme-icon" />}
            </button>
            
            {showInput && (
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="logo-section">
                            <img src={UsTalkLogo} alt="UsTalk" className="logo" />
                            <h1 className="app-title">UsTalkChat</h1>
                        </div>
                        
                        <p className="app-subtitle">Connect and chat with people around the world</p>
                        
                        <form onSubmit={handleEnterChat} className="auth-form">
                            <div className="input-group">
                                <label htmlFor="userName" className="input-label">
                                    Enter Your Username
                                </label>
                                <input
                                    type="text"
                                    value={userName}
                                    id="userName"
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Your username..."
                                    className="auth-input"
                                    required
                                />
                            </div>
                            
                            <button type="submit" className="auth-button">
                                <FaDoorOpen className="button-icon" />
                                Enter Chat
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {enterChat && (
                <div className="rooms-container">
                    <div className="rooms-header">
                        <h2>Choose a Chat Room</h2>
                        <p>Select a room to start chatting</p>
                    </div>
                    
                    <div className="rooms-grid">
                        {rooms.map((room, index) => (
                            <div 
                                onClick={() => handleSend(room)} 
                                key={room} 
                                className="room-card"
                            >
                                <div className="room-icon">
                                    {index === 0 && "💬"}
                                    {index === 1 && "💻"}
                                    {index === 2 && "📚"}
                                </div>
                                <h3 className="room-name">{formatRoomName(room)}</h3>
                                <p className="room-desc">
                                    {index === 0 && "General discussions and casual talk"}
                                    {index === 1 && "Technology, programming and IT topics"}
                                    {index === 2 && "Study groups and educational content"}
                                </p>
                                <div className="room-join">
                                    Join Room <FaPaperPlane className="join-icon" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {startChat && (
                <div className="chat-container">
                    <div className="chat-sidebar">
                        <div className="sidebar-header">
                            <h3>Online Users</h3>
                            <FaUsers className="sidebar-icon" />
                        </div>
                        
                        <div className="users-list">
                            <div className="user-item current-user">
                                <div className="user-avatar">👤</div>
                                <div className="user-info">
                                    <span className="user-name">{userName}</span>
                                    <span className="user-status">Online</span>
                                </div>
                            </div>
                            
                            {availableUsers.map((user, index) => (
                                <div key={index} className="user-item">
                                    <div className="user-avatar">👤</div>
                                    <div className="user-info">
                                        <span className="user-name">{user}</span>
                                        <span className="user-status">Online</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button onClick={handleViewRooms} className="back-button">
                            <FaArrowLeftLong className="back-icon" />
                            Change Room
                        </button>
                    </div>

                    <div className="chat-main">
                        <div className="chat-header">
                            <div className="room-info">
                                <h2 className="room-title">{formatRoomName(currRoom)}</h2>
                                <span className="room-badge">Active</span>
                            </div>
                            <div className="user-welcome">
                                Welcome, <span className="username">{userName}</span>!
                            </div>
                        </div>

                        <div className="messages-container">
                            {getCurrentMessages().length > 0 ? (
                                <div className="messages-list">
                                    {getCurrentMessages().map((item) => (
                                        <div 
                                            key={item.id} 
                                            className={`message-item ${item.chatUser === userName ? 'own-message' : 'other-message'}`}
                                        >
                                            <div className="message-content">
                                                {item.chatUser !== userName && (
                                                    <div className="message-sender">{item.chatUser}</div>
                                                )}
                                                <div className="message-bubble">
                                                    {item.text}
                                                </div>
                                                <div className="message-time">
                                                    {new Date(item.ts).toLocaleTimeString([], { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            ) : (
                                <div className="empty-chat">
                                    <div className="empty-icon">💬</div>
                                    <h3>No messages yet</h3>
                                    <p>Start the conversation by sending a message!</p>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleChat} className="message-form">
                            <div className="input-container">
                                <input 
                                    ref={chatInputRef}
                                    type="text" 
                                    value={chatTxt} 
                                    id="chatTxt" 
                                    onChange={(e) => setChatTxt(e.target.value)} 
                                    placeholder="Type your message here..."
                                    className="message-input"
                                    required 
                                />
                                <button type="submit" className="send-button">
                                    <IoMdSend className="send-icon" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}