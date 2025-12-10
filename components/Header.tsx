"use client";

import Link from "next/link";
import { loadIdentity } from "@/lib/identity";
import { truncatePublicKey } from "@/lib/crypto";

export default function Header() {
  const identity = typeof window !== "undefined" ? loadIdentity() : null;
  const shortKey = identity ? truncatePublicKey(identity.publicKey, 8) : null;

  return (
    <header className="header">
      <div className="header-content">
        <Link href="/feed" className="header-title">
          Foundation Protocol
        </Link>
        <nav className="header-nav">
          <Link href="/feed">Feed</Link>
          <Link href="/identity">Identity</Link>
          {identity && (
            <span className="identity-indicator">{shortKey}</span>
          )}
        </nav>
      </div>
    </header>
  );
}

