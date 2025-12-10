// Type definitions for Foundation Protocol MVP

// Local-only identity
export type Identity = {
  id: string;            // uuid
  publicKey: string;     // hex/base58
  privateKey: string;    // secure storage only
  displayName: string;   // user-chosen label
  createdAt: number;     // unix ms
};

// Universal message
export type Message = {
  id: string;            // hash of (author + timestamp + content)
  authorPublicKey: string;
  authorDisplayName?: string;  // resolved client-side
  timestamp: number;     // unix ms
  contentType: "text";
  contentBody: string;   // plain text
  references: string[];  // ids of messages this replies to
  tags: string[];        // simple strings, e.g. ["general"]
  signature: string;     // signature over canonical payload
};

// Backend persistence model
export type StoredMessage = Message & {
  relayReceivedAt: number;  // unix ms
  relaySourceIp?: string;
};

// Node-level config (local only)
export type NodeConfig = {
  nodeId: string;
  lastSyncedAt: number | null;
};

// User roles
export type UserRole = "user" | "admin";

// Log entries (backend only)
export type LogEntry = {
  id: string;
  timestamp: number;
  level: "info" | "error";
  source: "api" | "worker";
  message: string;
  meta?: Record<string, unknown>;
};

// API Response types
export type ApiResponse<T> = {
  status: "ok";
  data: T;
} | {
  status: "error";
  error: string;
};

export type MessagesResponse = {
  status: "ok";
  messages: StoredMessage[];
} | {
  status: "error";
  error: string;
};

export type MessageResponse = {
  status: "ok";
  message: StoredMessage;
} | {
  status: "error";
  error: string;
};

export type PostMessageResponse = {
  status: "ok";
  id: string;
} | {
  status: "error";
  error: string;
};

export type LogsResponse = {
  status: "ok";
  logs: LogEntry[];
} | {
  status: "error";
  error: string;
};

export type SummarizeResponse = {
  status: "ok";
  summary: string;
} | {
  status: "error";
  error: string;
};

