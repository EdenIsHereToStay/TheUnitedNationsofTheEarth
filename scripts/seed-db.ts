// Seed script for development database

import { messageDb, logDb } from "../lib/db";
import { StoredMessage, LogEntry } from "../types";

const seedMessages: StoredMessage[] = [
  {
    id: "msg-1",
    authorPublicKey: "PUB_DEMO_1",
    authorDisplayName: "Demo Alice",
    timestamp: 1700000010000,
    contentType: "text",
    contentBody: "Welcome to the Foundation Protocol demo feed.",
    references: [],
    tags: ["general"],
    signature: "SIG_MSG_1",
    relayReceivedAt: 1700000010100,
  },
  {
    id: "msg-2",
    authorPublicKey: "PUB_DEMO_2",
    authorDisplayName: "Demo Bob",
    timestamp: 1700000020000,
    contentType: "text",
    contentBody: "Replying to the first message.",
    references: ["msg-1"],
    tags: ["general"],
    signature: "SIG_MSG_2",
    relayReceivedAt: 1700000020100,
  },
];

const seedLogs: LogEntry[] = [
  {
    id: "log-1",
    timestamp: Date.now() - 3600000,
    level: "info",
    source: "api",
    message: "Database seeded successfully",
  },
  {
    id: "log-2",
    timestamp: Date.now() - 1800000,
    level: "info",
    source: "api",
    message: "Server started",
  },
];

function seed() {
  console.log("Seeding database...");

  // Seed messages
  for (const message of seedMessages) {
    try {
      messageDb.insert(message);
      console.log(`Inserted message: ${message.id}`);
    } catch (error) {
      console.error(`Failed to insert message ${message.id}:`, error);
    }
  }

  // Seed logs
  for (const log of seedLogs) {
    try {
      logDb.insert(log);
      console.log(`Inserted log: ${log.id}`);
    } catch (error) {
      console.error(`Failed to insert log ${log.id}:`, error);
    }
  }

  console.log("Seeding complete!");
}

seed();

