"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { LogEntry } from "@/types";
import { format } from "date-fns";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filters, setFilters] = useState({
    level: "",
    source: "",
  });

  useEffect(() => {
    // Check if already authenticated (token in localStorage)
    const storedToken = localStorage.getItem("admin_token");
    if (storedToken) {
      setAdminToken(storedToken);
      setIsAuthenticated(true);
      loadLogs(storedToken);
    }
  }, []);

  const loadLogs = async (token?: string) => {
    const tokenToUse = token || adminToken;
    if (!tokenToUse) return;

    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (filters.level) queryParams.append("level", filters.level);
      if (filters.source) queryParams.append("source", filters.source);
      queryParams.append("limit", "100");

      const response = await fetch(`/api/admin/logs?${queryParams.toString()}`, {
        headers: {
          "X-Admin-Token": tokenToUse,
        },
      });

      const result = await response.json();

      if (result.status === "error") {
        if (response.status === 403) {
          setIsAuthenticated(false);
          setError("Invalid admin token");
        } else {
          throw new Error(result.error);
        }
        return;
      }

      setLogs(result.logs);
      setIsAuthenticated(true);
      localStorage.setItem("admin_token", tokenToUse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
      console.error("Error loading logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadLogs();
    }
  }, [filters.level, filters.source]);

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="container">
          <div className="card">
            <h1 style={{ marginBottom: "1rem" }}>Admin Logs</h1>
            <p style={{ marginBottom: "1.5rem", color: "#666" }}>
              Enter your admin token to view system logs.
            </p>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={handleLogin}>
              <input
                type="password"
                className="input"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                placeholder="Admin Token"
                style={{ marginBottom: "1rem" }}
              />
              <button type="submit" className="btn btn-primary">
                Authenticate
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1>Admin Logs</h1>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setIsAuthenticated(false);
              setAdminToken("");
              localStorage.removeItem("admin_token");
            }}
          >
            Logout
          </button>
        </div>

        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>Filters</h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                Level
              </label>
              <select
                className="input"
                value={filters.level}
                onChange={(e) => handleFilterChange("level", e.target.value)}
                style={{ width: "auto", minWidth: "150px" }}
              >
                <option value="">All</option>
                <option value="info">Info</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                Source
              </label>
              <select
                className="input"
                value={filters.source}
                onChange={(e) => handleFilterChange("source", e.target.value)}
                style={{ width: "auto", minWidth: "150px" }}
              >
                <option value="">All</option>
                <option value="api">API</option>
                <option value="worker">Worker</option>
              </select>
            </div>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {isLoading ? (
          <div className="loading">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="card">
            <p style={{ textAlign: "center", color: "#666" }}>No logs found.</p>
          </div>
        ) : (
          <div className="card">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: 600 }}>Timestamp</th>
                  <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: 600 }}>Level</th>
                  <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: 600 }}>Source</th>
                  <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: 600 }}>Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                      {format(new Date(log.timestamp), "PPp")}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          backgroundColor: log.level === "error" ? "#fee2e2" : "#dbeafe",
                          color: log.level === "error" ? "#991b1b" : "#1e40af",
                        }}
                      >
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>{log.source}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <div>{log.message}</div>
                      {log.meta && (
                        <details style={{ marginTop: "0.5rem" }}>
                          <summary style={{ cursor: "pointer", fontSize: "0.875rem", color: "#666" }}>
                            Metadata
                          </summary>
                          <pre
                            style={{
                              marginTop: "0.5rem",
                              padding: "0.5rem",
                              backgroundColor: "#f0f0f0",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              overflow: "auto",
                            }}
                          >
                            {JSON.stringify(log.meta, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

