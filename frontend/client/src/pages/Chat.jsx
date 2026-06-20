import { useEffect, useState, useMemo } from "react";
import API_URL from "../config/api";
import socket from "../socket";

function Chat() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);

    // Get current user efficiently (prevents parsing on every render)
    const currentUser = useMemo(() => JSON.parse(localStorage.getItem("user")) || null, []);

    // Send Message
    const sendMessage = () => {
        if (!currentUser) return console.log("❌ User not logged in");
        if (!selectedUser) return console.log("❌ Select a user first");
        if (!message.trim()) return console.log("❌ Empty Message");

        const messageData = {
            senderId: currentUser.id,
            receiverId: selectedUser._id,
            text: message.trim(),
        };

        socket.emit("send_message", messageData);
        console.log("📤 Message Sent:", messageData);
        setMessage("");
    };

    // Initialize User Online Status
    useEffect(() => {
        if (currentUser) {
            socket.emit("user_online", currentUser.id);
        }
    }, [currentUser]);

    // Track Online Users
    useEffect(() => {
        const handleOnlineUsers = (users) => {
            console.log("🟢 Online Users:", users);
            setOnlineUsers(users);
        };

        socket.on("online_users", handleOnlineUsers);
        return () => socket.off("online_users", handleOnlineUsers);
    }, []);

    // Load Conversation Messages
    useEffect(() => {
        const fetchConversation = async () => {
            if (!currentUser || !selectedUser) return;

            try {
                const response = await fetch(
                    `${API_URL}/api/messages/${currentUser.id}/${selectedUser._id}`
                );
                const data = await response.json();
                console.log("📦 Conversation Loaded:", data);
                setMessages(data);
            } catch (error) {
                console.error("❌ Fetch Messages Error:", error);
            }
        };

        fetchConversation();
    }, [selectedUser, currentUser]);

    // Load All Users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${API_URL}/api/users`);
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("❌ Fetch Users Error:", error);
            }
        };

        fetchUsers();
    }, []);

    // Real-time Socket Listener
    useEffect(() => {
        const handleReceiveMessage = (data) => {
            console.log("📥 Message Received:", data);
            setMessages((prev) => [...prev, data]);
        };

        socket.on("receive_message", handleReceiveMessage);
        return () => socket.off("receive_message", handleReceiveMessage);
    }, []);

    // Handle Avatar Upload
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const uploadResponse = await fetch(`${API_URL}/api/upload/avatar`, {
                method: "POST",
                body: formData,
            });
            const uploadData = await uploadResponse.json();

            await fetch(`${API_URL}/api/users/avatar/${currentUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    avatar: uploadData.imageUrl,
                }),
            });

            alert("✅ Profile Picture Updated Successfully!");
        } catch (error) {
            console.error("❌ Avatar Upload Error:", error);
            alert("Failed to upload profile picture.");
        }
    };

    return (
        <div className="h-screen flex bg-[#17212b] font-sans">

            {/* --- Sidebar --- */}
            <div
                className={`bg-[#1f2c38] border-r border-gray-700 overflow-y-auto w-full md:w-80 ${showChat ? "hidden md:block" : "block"
                    }`}
            >
                <div className="p-4 text-white text-xl font-bold border-b border-gray-700 sticky top-0 bg-[#1f2c38] z-10">
                    Telegram Clone
                </div>

                <div className="p-3 space-y-2">
                    {users.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => {
                                setSelectedUser(user);
                                setShowChat(true);
                            }}
                            className={`p-3 rounded-xl cursor-pointer transition duration-200 flex items-center gap-4 ${selectedUser?._id === user._id
                                    ? "bg-[#2b5278] shadow-md"
                                    : "bg-[#22303c] hover:bg-[#2c3e50]"
                                }`}
                        >
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-[#34638f] flex items-center justify-center text-white font-bold text-lg relative shrink-0 shadow-sm">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.username}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    user.username.charAt(0).toUpperCase()
                                )}

                                {/* Online Dot indicator */}
                                {onlineUsers.includes(user._id) && (
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#22303c]"></div>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 overflow-hidden">
                                <div className="text-white font-semibold truncate">
                                    {user.username}
                                </div>
                                <div
                                    className={`text-xs mt-0.5 ${onlineUsers.includes(user._id)
                                            ? "text-green-400 font-medium"
                                            : "text-gray-400"
                                        }`}
                                >
                                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Chat Section --- */}
            <div className={`flex-1 flex flex-col relative ${showChat ? "block" : "hidden md:flex"}`}>

                {/* Header */}
                <div className="bg-[#1f2c38] p-4 text-white border-b border-gray-700 flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowChat(false)}
                            className="md:hidden text-gray-400 hover:text-white transition text-2xl pr-2"
                        >
                            &#8592;
                        </button>

                        <div className="w-10 h-10 rounded-full bg-[#2b5278] flex items-center justify-center font-bold shadow-inner">
                            {selectedUser ? selectedUser.username.charAt(0).toUpperCase() : "?"}
                        </div>

                        <div>
                            <div className="font-semibold text-lg leading-tight">
                                {selectedUser ? selectedUser.username : "Select a User"}
                            </div>
                            {selectedUser && (
                                <div className="text-xs text-green-400 font-medium">
                                    {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Styled File Upload */}
                        <label className="cursor-pointer bg-[#22303c] hover:bg-[#2b5278] transition px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white shadow-sm border border-gray-600">
                            Upload Avatar
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                            />
                        </label>

                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                localStorage.removeItem("user");
                                window.location.href = "/";
                            }}
                            className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition px-4 py-2 rounded-lg text-sm font-semibold border border-red-500/50"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Messages Display */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#0e1621] custom-scrollbar">
                    {messages.length === 0 && selectedUser && (
                        <div className="m-auto text-gray-500 bg-[#1f2c38] px-4 py-2 rounded-full text-sm">
                            No messages yet. Say hi! 👋
                        </div>
                    )}

                    {messages.map((msg, index) => {
                        const isMyMessage = msg.senderId === currentUser?.id;

                        return (
                            <div
                                key={msg._id || index}
                                className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                            >

                                <div
                                    className={`max-w-[75%] px-4 py-2.5 text-[15px] break-words shadow-sm ${isMyMessage
                                            ? "bg-[#2b5278] text-white rounded-2xl rounded-tr-sm"
                                            : "bg-[#1f2c38] text-gray-100 rounded-2xl rounded-tl-sm"
                                        }`}
                                >

                                    <div>{msg.text}</div>

                                    <div className="flex justify-end items-center gap-1 text-[10px] mt-1 opacity-80">

                                        <span>
                                            {msg.createdAt
                                                ? new Date(
                                                    msg.createdAt
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })
                                                : ""}
                                        </span>

                                        {isMyMessage && (
                                            <span>
                                                {msg.status === "sent" && "✓"}

                                                {msg.status === "delivered" &&
                                                    "✓✓"}

                                                {msg.status === "seen" &&
                                                    "✓✓👁"}
                                            </span>
                                        )}

                                    </div>

                                </div>

                            </div>
                        );
                    })}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[#1f2c38] flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        disabled={!selectedUser}
                        className="flex-1 bg-[#17212b] text-white px-5 py-3 rounded-full outline-none border border-transparent focus:border-[#2b5278] focus:ring-1 focus:ring-[#2b5278] disabled:opacity-50 transition-all placeholder-gray-500 shadow-inner"
                        placeholder={
                            selectedUser
                                ? `Message ${selectedUser.username}...`
                                : "Select a user to start chatting"
                        }
                    />

                    <button
                        onClick={sendMessage}
                        disabled={!selectedUser || !message.trim()}
                        className={`px-6 py-3 rounded-full font-semibold transition-all shadow-md flex items-center justify-center ${!selectedUser || !message.trim()
                                ? "bg-gray-700 text-gray-400 cursor-not-allowed opacity-70"
                                : "bg-[#2b5278] text-white hover:bg-[#34638f] hover:shadow-lg active:scale-95"
                            }`}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;