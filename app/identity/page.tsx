"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { generateKeypair } from "@/lib/crypto";
import { loadIdentity, saveIdentity, updateDisplayName, hasIdentity } from "@/lib/identity";
import { Identity } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

export default function IdentityPage() {
  const router = useRouter();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadIdentity();
    if (existing) {
      setIdentity(existing);
      setDisplayName(existing.displayName);
    }
  }, []);

  const handleCreateIdentity = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const { publicKey, privateKey } = await generateKeypair();
      const newIdentity: Identity = {
        id: uuidv4(),
        publicKey,
        privateKey,
        displayName: "Anonymous",
        createdAt: Date.now(),
      };

      saveIdentity(newIdentity);
      setIdentity(newIdentity);
      setDisplayName(newIdentity.displayName);
      router.push("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create identity");
      console.error("Error creating identity:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!identity) return;

    setIsUpdating(true);
    setError(null);

    try {
      const updated = updateDisplayName(displayName.trim() || "Anonymous");
      if (updated) {
        setIdentity(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update display name");
      console.error("Error updating display name:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!identity) {
    return (
      <>
        <Header />
        <div className="container">
          <div className="card">
            <h1 style={{ marginBottom: "1rem" }}>Create Your Identity</h1>
            <p style={{ marginBottom: "1.5rem", color: "#666" }}>
              Your identity is a cryptographic keypair stored locally in your browser.
              No accounts, no passwords, no email required.
            </p>
            {error && <div className="error-banner">{error}</div>}
            <button
              className="btn btn-primary"
              onClick={handleCreateIdentity}
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Identity"}
            </button>
          </div>
        </div>
      </>
    );
  }

  const createdAt = format(new Date(identity.createdAt), "PPp");

  return (
    <>
      <Header />
      <div className="container">
        <div className="card">
          <h1 style={{ marginBottom: "1rem" }}>Your Identity</h1>
          {error && <div className="error-banner">{error}</div>}
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Display Name
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
              <button
                className="btn btn-primary"
                onClick={handleUpdateDisplayName}
                disabled={isUpdating || displayName === identity.displayName}
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Public Key
            </label>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.875rem",
                backgroundColor: "#f0f0f0",
                padding: "0.75rem",
                borderRadius: "6px",
                wordBreak: "break-all",
              }}
            >
              {identity.publicKey}
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
              Created At
            </label>
            <div style={{ color: "#666" }}>{createdAt}</div>
          </div>
        </div>
      </div>
    </>
  );
}

