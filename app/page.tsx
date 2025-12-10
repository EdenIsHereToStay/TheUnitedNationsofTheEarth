"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasIdentity } from "@/lib/identity";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to feed if identity exists, otherwise to identity page
    if (hasIdentity()) {
      router.push("/feed");
    } else {
      router.push("/identity");
    }
  }, [router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div className="loading">Loading...</div>
    </div>
  );
}

