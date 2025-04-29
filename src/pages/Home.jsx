import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Home.css"; // Import the CSS file

export default function Home() {
  const [threadId, setThreadId] = useState("");
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleJoin = async () => {
    if (threadId.trim()) {
      try {
        const res = await fetch(`${backendUrl}/api/threads/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ threadId }),
        });

        const data = await res.json();

        if (res.ok) {
          navigate(`/chat/${data.name}`); // or data._id if you prefer
        } else {
          alert(data.error || "Failed to join thread.");
        }
      } catch (err) {
        console.error(err);
        alert("Error connecting to server.");
      }
    }
  };

  return (
    <div className="home-container">
      <div className="chat-box-1">
        <h1 className="heading">Join a Chat Thread</h1>
        <input
          type="text"
          placeholder="Enter Thread ID"
          value={threadId}
          onChange={(e) => setThreadId(e.target.value)}
          className="input-field"
        />
        <button onClick={handleJoin} className="join-button">
          Join
        </button>
      </div>
    </div>
  );
}
