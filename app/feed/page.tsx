"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import MessageComposer from "@/components/MessageComposer";
import MessageItem from "@/components/MessageItem";
import Toast from "@/components/Toast";
import { loadIdentity, hasIdentity } from "@/lib/identity";
import { StoredMessage } from "@/types";

type ToastState = {
  message: string;
  type: "success" | "error";
} | null;

export default function FeedPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if no identity
    if (typeof window !== "undefined" && !hasIdentity()) {
      router.push("/identity");
      return;
    }

    loadFeed();
  }, [router]);

  const loadFeed = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/messages?limit=50");
      const result = await response.json();

      if (result.status === "error") {
        throw new Error(result.error);
      }

      setMessages(result.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feed");
      console.error("Error loading feed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessagePosted = (message: StoredMessage) => {
    setMessages((prev) => [message, ...prev]);
    setToast({ message: "Message posted successfully!", type: "success" });
  };

  const handleSummarize = async () => {
    if (messages.length === 0) {
      setToast({ message: "No messages to summarize", type: "error" });
      return;
    }

    setIsSummarizing(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/summarize-feed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.slice(0, 20), // Last 20 messages
          maxWords: 100,
        }),
      });

      const result = await response.json();

      if (result.status === "error") {
        throw new Error(result.error);
      }

      setSummary(result.summary);
      setToast({ message: "Feed summarized successfully!", type: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to summarize feed");
      setToast({
        message: err instanceof Error ? err.message : "Failed to summarize feed",
        type: "error",
      });
      console.error("Error summarizing feed:", err);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1>Global Feed</h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn btn-secondary"
              onClick={loadFeed}
              disabled={isLoading}
            >
              Refresh
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleSummarize}
              disabled={isSummarizing || messages.length === 0}
            >
              {isSummarizing ? "Summarizing..." : "Summarize Feed (AI)"}
            </button>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {summary && (
          <div className="card" style={{ marginBottom: "1.5rem", backgroundColor: "#f0f9ff", border: "1px solid #bae6fd" }}>
            <h2 style={{ marginBottom: "0.5rem", fontSize: "1.25rem" }}>AI Summary</h2>
            <p style={{ lineHeight: "1.6" }}>{summary}</p>
            <button
              className="btn btn-secondary"
              onClick={() => setSummary(null)}
              style={{ marginTop: "0.75rem" }}
            >
              Close
            </button>
          </div>
        )}

        <MessageComposer onMessagePosted={handleMessagePosted} />

        {isLoading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="card">
            <p style={{ textAlign: "center", color: "#666" }}>No messages yet. Be the first to post!</p>
          </div>
        ) : (
          <div className="card">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

