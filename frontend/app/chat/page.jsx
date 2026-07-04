"use client";

import { useState } from "react";
import NavBar from "../../components/NavBar";
import ChatPanel from "../../components/ChatPanel";
import { askAgent } from "../../lib/api";
import { chatHistory } from "../../lib/mockData";

export default function ChatPage() {
  const [messages, setMessages] = useState(chatHistory);

  const handleSend = async (text) => {
    setMessages((prev) => [...prev, { id: `u${prev.length}`, role: "user", text }]);
    try {
      const res = await askAgent(text);
      setMessages((prev) => [...prev, {
        id: `a${prev.length}`,
        role: "assistant",
        text: res.answer,
        trace: res.trace
      }]);
    } catch (e) {
      setMessages((prev) => [...prev, {
        id: `a${prev.length}`,
        role: "assistant",
        text: "I couldn't reach the AI agent service. (Fallback mock: You spent ₹4,100 on dining in June)."
      }]);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-cream dark:bg-cream-dark">
      <NavBar />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-4 py-6 md:px-6">
        <p className="mb-3 text-page-title text-ink dark:text-ink-dark">Chat</p>
        <div className="flex-1 overflow-hidden">
          <ChatPanel messages={messages} onSend={handleSend} title="Full conversation" />
        </div>
      </main>
    </div>
  );
}
