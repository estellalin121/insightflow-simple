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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.reply || "系统有点累了，我们换个角度聊聊？",
        },
      ]);
    } catch {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, mode: "insight" }),
      });

      const data = await res.json();

      setMessages([
        ...messages,
        {
          role: "assistant",
          content: `🧠 Insight总结：\n${data.reply || "暂时还没有生成有效总结。"}`,
        },
      ]);
    } catch {
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
    <main style={styles.page}>
      <section style={styles.shell}>
        <header style={styles.header}>
          <div>
            <div style={styles.badge}>Content × Self Insight</div>
            <h1 style={styles.title}>InsightFlow</h1>
            <p style={styles.subtitle}>
              通过你喜欢的角色、作品和剧情，慢慢看见情绪背后的自己。
            </p>
          </div>
        </header>

        <section style={styles.chatPanel}>
          {messages.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>🌙</div>
              <h2 style={styles.emptyTitle}>从一个喜欢的角色开始</h2>
              <p style={styles.emptyText}>
                最近有没有哪部作品、某个角色或一段剧情，让你有一点在意，甚至有点放不下？
              </p>
            </div>
          ) : (
            <div style={styles.messages}>
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                const isInsight = message.content.startsWith("🧠 Insight总结");

                return (
                  <div
                    key={index}
                    style={{
                      ...styles.messageRow,
                      justifyContent: isUser ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        ...styles.bubble,
                        ...(isUser ? styles.userBubble : styles.aiBubble),
                        ...(isInsight ? styles.insightBubble : {}),
                      }}
                    >
                      <div style={styles.messageLabel}>
                        {isUser ? "你" : isInsight ? "Insight 总结" : "InsightFlow"}
                      </div>
                      <div style={styles.messageText}>{message.content.replace("🧠 Insight总结：\n", "")}</div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
                  <div style={{ ...styles.bubble, ...styles.aiBubble }}>
                    <div style={styles.messageLabel}>InsightFlow</div>
                    <div style={styles.messageText}>正在想一想...</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <footer style={styles.footer}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="说说你喜欢的作品、角色，或一个让你在意的情节..."
            style={styles.input}
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <div style={styles.actions}>
            <button
              onClick={generateInsight}
              disabled={loading || messages.length === 0}
              style={{
                ...styles.secondaryButton,
                opacity: loading || messages.length === 0 ? 0.45 : 1,
              }}
            >
              🧠 总结一下
            </button>

            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                ...styles.primaryButton,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "发送中..." : "发送"}
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f7f4ef 0%, #f6efe9 42%, #eef3f5 100%)",
    padding: "32px 16px",
    boxSizing: "border-box",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    color: "#241f1c",
  },
  shell: {
    maxWidth: 920,
    margin: "0 auto",
    minHeight: "calc(100vh - 64px)",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  header: {
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(120,92,72,0.12)",
    borderRadius: 28,
    padding: "28px 30px",
    boxShadow: "0 18px 60px rgba(70, 46, 30, 0.08)",
    backdropFilter: "blur(14px)",
  },
  badge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 999,
    background: "#efe4da",
    color: "#7b5b45",
    fontSize: 13,
    marginBottom: 12,
  },
  title: {
    margin: 0,
    fontSize: 42,
    letterSpacing: "-1.2px",
    lineHeight: 1.05,
  },
  subtitle: {
    margin: "14px 0 0",
    color: "#756960",
    fontSize: 16,
    lineHeight: 1.7,
  },
  chatPanel: {
    flex: 1,
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(120,92,72,0.12)",
    borderRadius: 28,
    padding: 22,
    boxShadow: "0 18px 60px rgba(70, 46, 30, 0.08)",
    overflow: "auto",
  },
  empty: {
    minHeight: 360,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#6f6259",
    padding: 24,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 14,
  },
  emptyTitle: {
    margin: 0,
    fontSize: 24,
    color: "#2c2520",
  },
  emptyText: {
    maxWidth: 520,
    margin: "14px auto 0",
    lineHeight: 1.8,
    fontSize: 16,
  },
  messages: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  messageRow: {
    display: "flex",
    width: "100%",
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 22,
    padding: "14px 16px",
    lineHeight: 1.75,
    fontSize: 15.5,
    whiteSpace: "pre-wrap",
    boxShadow: "0 8px 28px rgba(40, 28, 20, 0.06)",
  },
  userBubble: {
    background: "#2c2520",
    color: "#fff",
    borderTopRightRadius: 8,
  },
  aiBubble: {
    background: "#fffaf5",
    color: "#2d2824",
    border: "1px solid rgba(120,92,72,0.12)",
    borderTopLeftRadius: 8,
  },
  insightBubble: {
    background: "#f3eadf",
    border: "1px solid rgba(134, 98, 63, 0.2)",
  },
  messageLabel: {
    fontSize: 12,
    opacity: 0.62,
    marginBottom: 6,
    fontWeight: 700,
  },
  messageText: {
    fontSize: 15.5,
  },
  footer: {
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(120,92,72,0.12)",
    borderRadius: 28,
    padding: 16,
    boxShadow: "0 18px 60px rgba(70, 46, 30, 0.08)",
    display: "flex",
    gap: 12,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    resize: "none",
    border: "1px solid rgba(120,92,72,0.18)",
    borderRadius: 18,
    padding: "13px 15px",
    fontSize: 15,
    lineHeight: 1.6,
    outline: "none",
    background: "#fffaf7",
    color: "#2c2520",
  },
  actions: {
    display: "flex",
    gap: 10,
  },
  primaryButton: {
    border: "none",
    borderRadius: 16,
    padding: "13px 18px",
    background: "#2c2520",
    color: "#fff",
    fontSize: 15,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  secondaryButton: {
    border: "1px solid rgba(120,92,72,0.18)",
    borderRadius: 16,
    padding: "13px 16px",
    background: "#fff6ee",
    color: "#5b4637",
    fontSize: 15,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};
