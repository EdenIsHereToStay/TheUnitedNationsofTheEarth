"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import MessageComposer from "@/components/MessageComposer";
import MessageItem from "@/components/MessageItem";
import Toast from "@/components/Toast";
import { StoredMessage } from "@/types";

type ToastState = {
  message: string;
  type: "success" | "error";
} | null;

export default function MessageThreadPage() {
  const router = useRouter();
  const params = useParams();
  const messageId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [rootMessage, setRootMessage] = useState<StoredMessage | null>(null);
  const [replies, setReplies] = useState<StoredMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    loadThread();
  }, [messageId]);

  const loadThread = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load root message
      const messageResponse = await fetch(`/api/messages/${messageId}`);
      const messageResult = await messageResponse.json();

      if (messageResult.status === "error") {
        throw new Error(messageResult.error);
      }

      setRootMessage(messageResult.message);

      // Load replies
      const repliesResponse = await fetch(`/api/messages/${messageId}/replies`);
      const repliesResult = await repliesResponse.json();

      if (repliesResult.status === "error") {
        throw new Error(repliesResult.error);
      }

      setReplies(repliesResult.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load thread");
      console.error("Error loading thread:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplyPosted = (message: StoredMessage) => {
    setReplies((prev) => [...prev, message]);
    setToast({ message: "Reply posted successfully!", type: "success" });
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container">
          <div className="loading">Loading thread...</div>
        </div>
      </>
    );
  }

  if (error || !rootMessage) {
    return (
      <>
        <Header />
        <div className="container">
          <div className="error-banner">
            {error || "Message not found"}
          </div>
          <button className="btn btn-primary" onClick={() => router.push("/feed")}>
            Back to Feed
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container">
        <button
          className="btn btn-secondary"
          onClick={() => router.push("/feed")}
          style={{ marginBottom: "1rem" }}
        >
          ← Back to Feed
        </button>

        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>Thread</h2>
          <MessageItem message={rootMessage} showReplyButton={false} />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>Replies ({replies.length})</h2>
          <MessageComposer
            onMessagePosted={handleReplyPosted}
            replyTo={messageId}
          />
        </div>

        {replies.length > 0 ? (
          <div className="card">
            {replies.map((reply) => (
              <MessageItem key={reply.id} message={reply} showReplyButton={false} />
            ))}
          </div>
        ) : (
          <div className="card">
            <p style={{ textAlign: "center", color: "#666" }}>No replies yet. Be the first to reply!</p>
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

