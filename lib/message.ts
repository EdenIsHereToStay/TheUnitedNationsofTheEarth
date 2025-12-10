// Message creation and validation utilities

import { Message } from "@/types";
import {
  createCanonicalPayload,
  computeMessageId,
  signMessage,
  verifySignature,
} from "./crypto";

/**
 * Create a new message
 */
export async function createMessage(
  authorPublicKey: string,
  privateKey: string,
  contentBody: string,
  references: string[] = [],
  tags: string[] = []
): Promise<Message> {
  const timestamp = Date.now();
  const contentType = "text";

  const canonicalPayload = createCanonicalPayload(
    authorPublicKey,
    timestamp,
    contentType,
    contentBody,
    references,
    tags
  );

  const id = await computeMessageId(canonicalPayload);
  const signature = await signMessage(canonicalPayload, privateKey);

  return {
    id,
    authorPublicKey,
    timestamp,
    contentType,
    contentBody,
    references,
    tags,
    signature,
  };
}

/**
 * Validate and verify a message
 */
export async function validateMessage(message: Message): Promise<{
  valid: boolean;
  error?: string;
}> {
  // Recompute ID
  const canonicalPayload = createCanonicalPayload(
    message.authorPublicKey,
    message.timestamp,
    message.contentType,
    message.contentBody,
    message.references,
    message.tags
  );

  const expectedId = await computeMessageId(canonicalPayload);
  if (expectedId !== message.id) {
    return {
      valid: false,
      error: `Message ID mismatch. Expected ${expectedId}, got ${message.id}`,
    };
  }

  // Verify signature
  const signatureValid = await verifySignature(
    canonicalPayload,
    message.signature,
    message.authorPublicKey
  );

  if (!signatureValid) {
    return {
      valid: false,
      error: "Invalid message signature",
    };
  }

  return { valid: true };
}

