// Cryptographic utilities for identity and message signing

/**
 * Generate a new keypair using Web Crypto API
 */
export async function generateKeypair(): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"]
  );

  // Export keys as raw format
  const publicKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const privateKeyRaw = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  // Convert to hex strings
  const publicKeyHex = Array.from(new Uint8Array(publicKeyRaw))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  const privateKeyHex = Array.from(new Uint8Array(privateKeyRaw))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return {
    publicKey: publicKeyHex,
    privateKey: privateKeyHex,
  };
}

/**
 * Create a canonical payload string for signing
 */
export function createCanonicalPayload(
  authorPublicKey: string,
  timestamp: number,
  contentType: string,
  contentBody: string,
  references: string[],
  tags: string[]
): string {
  return JSON.stringify({
    authorPublicKey,
    timestamp,
    contentType,
    contentBody,
    references: references.sort(),
    tags: tags.sort(),
  });
}

/**
 * Compute message ID from canonical payload
 */
export async function computeMessageId(canonicalPayload: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(canonicalPayload);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Sign a message using private key
 */
export async function signMessage(
  canonicalPayload: string,
  privateKeyHex: string
): Promise<string> {
  // Import private key
  const privateKeyBuffer = new Uint8Array(
    privateKeyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    false,
    ["sign"]
  );

  // Sign the payload
  const encoder = new TextEncoder();
  const data = encoder.encode(canonicalPayload);
  const signature = await crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: "SHA-256",
    },
    privateKey,
    data
  );

  // Convert to hex
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return signatureHex;
}

/**
 * Verify a message signature
 */
export async function verifySignature(
  canonicalPayload: string,
  signatureHex: string,
  publicKeyHex: string
): Promise<boolean> {
  try {
    // Import public key
    const publicKeyBuffer = new Uint8Array(
      publicKeyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    const publicKey = await crypto.subtle.importKey(
      "raw",
      publicKeyBuffer,
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      false,
      ["verify"]
    );

    // Verify signature
    const signatureBuffer = new Uint8Array(
      signatureHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    const encoder = new TextEncoder();
    const data = encoder.encode(canonicalPayload);

    return await crypto.subtle.verify(
      {
        name: "ECDSA",
        hash: "SHA-256",
      },
      publicKey,
      signatureBuffer,
      data
    );
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Truncate public key for display
 */
export function truncatePublicKey(publicKey: string, length: number = 8): string {
  return publicKey.substring(0, length) + "...";
}

