// Database layer using SQLite

import Database from "better-sqlite3";
import path from "path";
import { mkdirSync } from "fs";
import { StoredMessage, LogEntry } from "@/types";

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "foundation.db");

// Ensure data directory exists
try {
  mkdirSync(path.dirname(dbPath), { recursive: true });
} catch (e) {
  // Directory might already exist
}

const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    authorPublicKey TEXT NOT NULL,
    authorDisplayName TEXT,
    timestamp INTEGER NOT NULL,
    contentType TEXT NOT NULL DEFAULT 'text',
    contentBody TEXT NOT NULL,
    references TEXT NOT NULL, -- JSON array
    tags TEXT NOT NULL, -- JSON array
    signature TEXT NOT NULL,
    relayReceivedAt INTEGER NOT NULL,
    relaySourceIp TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
  CREATE INDEX IF NOT EXISTS idx_messages_author ON messages(authorPublicKey);
  CREATE INDEX IF NOT EXISTS idx_messages_references ON messages(references);

  CREATE TABLE IF NOT EXISTS logs (
    id TEXT PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    level TEXT NOT NULL,
    source TEXT NOT NULL,
    message TEXT NOT NULL,
    meta TEXT -- JSON object
  );

  CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);
  CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
  CREATE INDEX IF NOT EXISTS idx_logs_source ON logs(source);
`);

// Message operations
export const messageDb = {
  insert: (message: StoredMessage): void => {
    const stmt = db.prepare(`
      INSERT INTO messages (
        id, authorPublicKey, authorDisplayName, timestamp, contentType,
        contentBody, references, tags, signature, relayReceivedAt, relaySourceIp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      message.id,
      message.authorPublicKey,
      message.authorDisplayName || null,
      message.timestamp,
      message.contentType,
      message.contentBody,
      JSON.stringify(message.references),
      JSON.stringify(message.tags),
      message.signature,
      message.relayReceivedAt,
      message.relaySourceIp || null
    );
  },

  getById: (id: string): StoredMessage | null => {
    const stmt = db.prepare("SELECT * FROM messages WHERE id = ?");
    const row = stmt.get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      authorPublicKey: row.authorPublicKey,
      authorDisplayName: row.authorDisplayName,
      timestamp: row.timestamp,
      contentType: row.contentType,
      contentBody: row.contentBody,
      references: JSON.parse(row.references),
      tags: JSON.parse(row.tags),
      signature: row.signature,
      relayReceivedAt: row.relayReceivedAt,
      relaySourceIp: row.relaySourceIp,
    };
  },

  list: (limit: number = 50, before?: number): StoredMessage[] => {
    let query = "SELECT * FROM messages";
    const params: any[] = [];

    if (before) {
      query += " WHERE timestamp < ?";
      params.push(before);
    }

    query += " ORDER BY timestamp DESC LIMIT ?";
    params.push(limit);

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      authorPublicKey: row.authorPublicKey,
      authorDisplayName: row.authorDisplayName,
      timestamp: row.timestamp,
      contentType: row.contentType,
      contentBody: row.contentBody,
      references: JSON.parse(row.references),
      tags: JSON.parse(row.tags),
      signature: row.signature,
      relayReceivedAt: row.relayReceivedAt,
      relaySourceIp: row.relaySourceIp,
    }));
  },

  getReplies: (messageId: string): StoredMessage[] => {
    const stmt = db.prepare("SELECT * FROM messages WHERE references LIKE ?");
    const pattern = `%"${messageId}"%`;
    const rows = stmt.all(pattern) as any[];

    return rows.map(row => ({
      id: row.id,
      authorPublicKey: row.authorPublicKey,
      authorDisplayName: row.authorDisplayName,
      timestamp: row.timestamp,
      contentType: row.contentType,
      contentBody: row.contentBody,
      references: JSON.parse(row.references),
      tags: JSON.parse(row.tags),
      signature: row.signature,
      relayReceivedAt: row.relayReceivedAt,
      relaySourceIp: row.relaySourceIp,
    }));
  },
};

// Log operations
export const logDb = {
  insert: (entry: LogEntry): void => {
    const stmt = db.prepare(`
      INSERT INTO logs (id, timestamp, level, source, message, meta)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      entry.id,
      entry.timestamp,
      entry.level,
      entry.source,
      entry.message,
      entry.meta ? JSON.stringify(entry.meta) : null
    );
  },

  list: (options: {
    level?: string;
    source?: string;
    limit?: number;
    before?: number;
  } = {}): LogEntry[] => {
    const { level, source, limit = 100, before } = options;
    let query = "SELECT * FROM logs WHERE 1=1";
    const params: any[] = [];

    if (level) {
      query += " AND level = ?";
      params.push(level);
    }

    if (source) {
      query += " AND source = ?";
      params.push(source);
    }

    if (before) {
      query += " AND timestamp < ?";
      params.push(before);
    }

    query += " ORDER BY timestamp DESC LIMIT ?";
    params.push(limit);

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      level: row.level as "info" | "error",
      source: row.source as "api" | "worker",
      message: row.message,
      meta: row.meta ? JSON.parse(row.meta) : undefined,
    }));
  },
};

// Helper to create log entry
export function createLogEntry(
  level: "info" | "error",
  source: "api" | "worker",
  message: string,
  meta?: Record<string, unknown>
): LogEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    level,
    source,
    message,
    meta,
  };
}

