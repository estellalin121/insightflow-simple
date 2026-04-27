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
          content:
            data.reply || "系统有点累了，请稍等片刻后再次发送消息~",
        },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "系统有点累了，请稍等片刻后再次发送消息~",
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
          content: `INSIGHT_REPORT\n${
            data.reply || "暂时还没有生成有效总结。"
          }`,
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
          <div style={styles.badge}>Content × Self Insight</div>
          <h1 style={styles.title}>InsightFlow</h1>
          <p style={styles.subtitle}>
            通过你喜欢的角色、作品和剧情，慢慢看见情绪背后的自己。
          </p>
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
                const isInsight = message.content.startsWith("INSIGHT_REPORT");

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
                        {isUser
                          ? "我"
                          : isInsight
                          ? "Insight 小结"
                          : "InsightFlow"}
                      </div>

                      {isInsight ? (
                        <div>
                          <div style={styles.insightTitle}>
                            🧠 你的 Insight 小结
                          </div>
                          <div style={styles.messageText}>
                            {message.content.replace("INSIGHT_REPORT\n", "")}
                          </div>
                        </div>
                      ) : (
                        <div style={styles.messageText}>{message.content}</div>
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div
                  style={{ ...styles.messageRow, justifyContent: "flex-start" }}
                >
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
          <div style={styles.inputRow}>
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

            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                ...styles.primaryButton,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "发送中" : "发送"}
            </button>
          </div>

          <button
            onClick={generateInsight}
            disabled={loading || messages.length === 0}
            style={{
              ...styles.summaryButton,
              opacity: loading || messages.length === 0 ? 0.45 : 1,
            }}
          >
            🧠 总结一下
          </button>
        </footer>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background:
      "linear-gradient(135deg, #f7f4ef 0%, #f6efe9 42%, #eef3f5 100%)",
    boxSizing: "border-box",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    color: "#241f1c",
    padding: "clamp(12px, 3vw, 32px)",
  },

  shell: {
    width: "100%",
    maxWidth: 920,
    margin: "0 auto",
    minHeight: "calc(100dvh - 24px)",
    display: "flex",
    flexDirection: "column",
    gap: "clamp(12px, 2vw, 18px)",
  },

  header: {
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(120,92,72,0.12)",
    borderRadius: "clamp(20px, 5vw, 28px)",
    padding: "clamp(20px, 6vw, 30px)",
    boxShadow: "0 18px 60px rgba(70, 46, 30, 0.08)",
    backdropFilter: "blur(14px)",
  },

  badge: {
    display: "inline-block",
    padding: "5px 11px",
    borderRadius: 999,
    background: "#efe4da",
    color: "#7b5b45",
    fontSize: "clamp(11px, 3vw, 13px)",
    marginBottom: 12,
    whiteSpace: "nowrap",
  },

  title: {
    margin: 0,
    fontSize: "clamp(42px, 13vw, 72px)",
    letterSpacing: "-1.8px",
    lineHeight: 0.96,
  },

  subtitle: {
    margin: "clamp(14px, 4vw, 18px) 0 0",
    color: "#756960",
    fontSize: "clamp(16px, 4.5vw, 22px)",
    lineHeight: 1.65,
    maxWidth: 680,
  },

  chatPanel: {
    flex: 1,
    minHeight: "clamp(320px, 52dvh, 560px)",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(120,92,72,0.12)",
    borderRadius: "clamp(22px, 6vw, 28px)",
    padding: "clamp(16px, 4vw, 22px)",
    boxShadow: "0 18px 60px rgba(70, 46, 30, 0.08)",
    overflowY: "auto",
  },

  empty: {
    minHeight: "clamp(300px, 48dvh, 440px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#6f6259",
    padding: "clamp(18px, 5vw, 30px)",
  },

  emptyIcon: {
    fontSize: "clamp(34px, 10vw, 48px)",
    marginBottom: 14,
  },

  emptyTitle: {
    margin: 0,
    fontSize: "clamp(24px, 7vw, 36px)",
    lineHeight: 1.25,
    color: "#2c2520",
  },

  emptyText: {
    maxWidth: 560,
    margin: "16px auto 0",
    lineHeight: 1.85,
    fontSize: "clamp(16px, 4.4vw, 22px)",
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
    maxWidth: "min(82%, 720px)",
    borderRadius: 22,
    padding: "14px 16px",
    lineHeight: 1.75,
    fontSize: "clamp(15px, 4vw, 16px)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
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
    background: "linear-gradient(135deg, #f5eadc 0%, #fff7ef 100%)",
    border: "1px solid rgba(134, 98, 63, 0.24)",
    maxWidth: "min(92%, 760px)",
  },

  insightTitle: {
    fontSize: "clamp(16px, 4.5vw, 18px)",
    fontWeight: 800,
    marginBottom: 10,
    color: "#5d4535",
  },

  messageLabel: {
    fontSize: 12,
    opacity: 0.62,
    marginBottom: 6,
    fontWeight: 700,
  },

  messageText: {
    fontSize: "clamp(15px, 4vw, 16px)",
  },

  footer: {
    position: "sticky",
    bottom: 0,
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(120,92,72,0.12)",
    borderRadius: "clamp(22px, 6vw, 28px)",
    padding: "clamp(12px, 3vw, 16px)",
    boxShadow: "0 18px 60px rgba(70, 46, 30, 0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    backdropFilter: "blur(14px)",
  },

  inputRow: {
    display: "flex",
    gap: 8,
    alignItems: "stretch",
  },

  input: {
    flex: 1,
    minWidth: 0,
    resize: "none",
    border: "1px solid rgba(120,92,72,0.18)",
    borderRadius: 18,
    padding: "12px 14px",
    fontSize: "clamp(15px, 4vw, 16px)",
    lineHeight: 1.55,
    outline: "none",
    background: "#fffaf7",
    color: "#2c2520",
    minHeight: 52,
    maxHeight: 116,
  },

  primaryButton: {
    border: "none",
    borderRadius: 16,
    padding: "0 18px",
    minHeight: 52,
    background: "#2c2520",
    color: "#fff",
    fontSize: "clamp(14px, 3.8vw, 15px)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  summaryButton: {
    width: "100%",
    border: "1px solid rgba(120,92,72,0.18)",
    borderRadius: 16,
    height: 48,
    background: "#fff6ee",
    color: "#5b4637",
    fontSize: 15,
    cursor: "pointer",
  },
};
