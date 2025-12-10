"use client";

import { useState } from "react";
import { createMessage } from "@/lib/message";
import { loadIdentity } from "@/lib/identity";
import { StoredMessage } from "@/types";

type MessageComposerProps = {
  onMessagePosted: (message: StoredMessage) => void;
  replyTo?: string;
  onCancel?: () => void;
};

export default function MessageComposer({ onMessagePosted, replyTo, onCancel }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const identity = loadIdentity();
    if (!identity) {
      setError("No identity found. Please create an identity first.");
      return;
    }

    if (!content.trim()) {
      setError("Message content cannot be empty.");
      return;
    }

    setIsPosting(true);

    try {
      const tagArray = tags
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const references = replyTo ? [replyTo] : [];

      const message = await createMessage(
        identity.publicKey,
        identity.privateKey,
        content.trim(),
        references,
        tagArray
      );

      // Add display name
      const messageWithDisplayName = {
        ...message,
        authorDisplayName: identity.displayName,
      };

      // Post to API
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageWithDisplayName }),
      });

      const result = await response.json();

      if (result.status === "error") {
        throw new Error(result.error);
      }

      // Create StoredMessage for callback
      const storedMessage: StoredMessage = {
        ...messageWithDisplayName,
        relayReceivedAt: Date.now(),
      };

      onMessagePosted(storedMessage);
      setContent("");
      setTags("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post message");
      console.error("Error posting message:", err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        {error && <div className="error-banner">{error}</div>}
        <textarea
          className="textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={replyTo ? "Write a reply..." : "What's on your mind?"}
          disabled={isPosting}
        />
        <div style={{ marginTop: "0.75rem" }}>
          <input
            type="text"
            className="input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma-separated)"
            disabled={isPosting}
            style={{ marginBottom: "0.75rem" }}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" className="btn btn-primary" disabled={isPosting}>
              {isPosting ? "Posting..." : replyTo ? "Reply" : "Post"}
            </button>
            {onCancel && (
              <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isPosting}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

