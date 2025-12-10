// Identity management (client-side storage)

import { Identity } from "@/types";

const IDENTITY_STORAGE_KEY = "foundation_identity";

/**
 * Load identity from localStorage
 */
export function loadIdentity(): Identity | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(IDENTITY_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as Identity;
  } catch (error) {
    console.error("Failed to load identity:", error);
    return null;
  }
}

/**
 * Save identity to localStorage
 */
export function saveIdentity(identity: Identity): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(identity));
  } catch (error) {
    console.error("Failed to save identity:", error);
    throw error;
  }
}

/**
 * Update display name
 */
export function updateDisplayName(displayName: string): Identity | null {
  const identity = loadIdentity();
  if (!identity) return null;
  
  const updated = { ...identity, displayName };
  saveIdentity(updated);
  return updated;
}

/**
 * Check if identity exists
 */
export function hasIdentity(): boolean {
  return loadIdentity() !== null;
}

