import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "../socket";
import { useNavigate } from "react-router-dom";
import "../Chat.css"; // Import the CSS file

export default function Chat() {
  const { threadId } = useParams();
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    let storedUsername = localStorage.getItem("chat_username");

    if (!storedUsername) {
      storedUsername = prompt("Enter your name:");
      if (!storedUsername) {
        return navigate(`/`);
      }
      localStorage.setItem("chat_username", storedUsername);
    }
    setUserName(storedUsername);

    fetch(`${backendUrl}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: storedUsername }),
    })
      .then((res) => res.json())
      .then((data) => {
        setUserId(data.userId);
        socket.emit("join_thread", { threadId, userId: data.userId });
        fetch(`${backendUrl}/api/messages/${threadId}`)
          .then((res) => res.json())
          .then((msgs) => {
            setMessages(msgs);
          })
          .catch((err) => {
            console.error("Failed to fetch messages:", err);
          });
      });
  }, [threadId]);

  useEffect(() => {
    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("message_deleted", (msgId) => {
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    });

    socket.on("message_seen", (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? updated : m))
      );
    });

    return () => {
      socket.off("new_message");
      socket.off("message_deleted");
      socket.off("message_seen");
    };
  }, []);

  const sendMessage = () => {
    if (!text.trim() || !userId) return;
    socket.emit("send_message", {
      threadId,
      senderId: userId,
      senderName: userName,
      text,
    });
    setText("");
  };

  const deleteMessage = (id, sender) => {
    if (sender !== userId) return alert("Not your message");
    socket.emit("delete_message", { messageId: id, userId });
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        <div className="chat-header">Chat Room: {threadId}</div>

        <div className="messages-container">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`message ${
                msg.sender === userId ? "sent" : "received"
              }`}
            >
              <div className="message-content">
                <div className="sender">
                  {msg.sender === userId ? "You" : msg.senderName}
                </div>
                <div className="text">{msg.text}</div>
                {msg.sender === userId && (
                  <button
                    onClick={() => deleteMessage(msg._id, msg.sender)}
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="input-container">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
          />
          <button onClick={sendMessage} className="send-btn">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
