// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import { useParams } from "react-router-dom";

function ChatWithParams() {
  const { threadId } = useParams();
  return <Chat threadId={threadId} />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat/:threadId" element={<Chat />} />
    </Routes>
  );
}

export default App;
