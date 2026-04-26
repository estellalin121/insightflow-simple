"use client";

import { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
        }),
      });

      const data = await res.json();

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.reply || "系统有点累了，我们换个角度聊聊？",
        },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "服务器暂时出错了，请稍后再试。",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateInsight = async () => {
    if (messages.length === 0 || loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          mode: "insight",
        }),
      });

      const data = await res.json();

      setMessages([
        ...messages,
        {
          role: "assistant",
          content: `🧠 Insight总结：\n${data.reply || "暂时还没有生成有效总结。"}`,
        },
      ]);
    } catch (error) {
      setMessages([
        ...messages,
        {
          role: "assistant",
          content: "总结生成失败了，请稍后再试。",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1>InsightFlow</h1>

      <div style={{ marginBottom: 20, maxWidth: 900 }}>
        {messages.length === 0 && (
          <p>
            最近有没有哪部作品、某个角色或一段剧情，让你有一点在意，甚至有点放不下？
          </p>
        )}

        {messages.map((message, index) => (
          <div key={index} style={{ marginBottom: 14 }}>
            <b>{message.role === "user" ? "你" : "InsightFlow"}：</b>
            <span style={{ whiteSpace: "pre-wrap" }}>{message.content}</span>
          </div>
        ))}

        {loading && <p>InsightFlow 正在想一想...</p>}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="说点什么..."
        style={{ padding: 10, width: 420, maxWidth: "70%" }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        style={{ marginLeft: 10, padding: "10px 16px" }}
      >
        {loading ? "发送中..." : "发送"}
      </button>

      <button
        onClick={generateInsight}
        disabled={loading || messages.length === 0}
        style={{ marginLeft: 10, padding: "10px 16px" }}
      >
        🧠 总结一下
      </button>
    </main>
  );
}
