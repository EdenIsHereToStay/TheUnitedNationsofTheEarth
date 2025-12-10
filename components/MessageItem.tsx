"use client";

import Link from "next/link";
import { format } from "date-fns";
import { StoredMessage } from "@/types";
import { truncatePublicKey } from "@/lib/crypto";

type MessageItemProps = {
  message: StoredMessage;
  showReplyButton?: boolean;
};

export default function MessageItem({ message, showReplyButton = true }: MessageItemProps) {
  const authorName = message.authorDisplayName || truncatePublicKey(message.authorPublicKey, 8);
  const timestamp = format(new Date(message.timestamp), "PPp");

  return (
    <div className="message-item">
      <div className="message-header">
        <span className="message-author">{authorName}</span>
        <span className="message-timestamp">{timestamp}</span>
      </div>
      <div className="message-content">{message.contentBody}</div>
      {message.tags.length > 0 && (
        <div className="message-tags">
          {message.tags.map((tag, idx) => (
            <span key={idx} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      {showReplyButton && (
        <div className="message-actions">
          <Link href={`/message/${message.id}`}>View thread</Link>
        </div>
      )}
    </div>
  );
}

