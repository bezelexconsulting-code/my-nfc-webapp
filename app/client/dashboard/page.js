"use client";
import React, { useState } from "react";

export default function ClientDashboard() {
  const [email, setEmail] = useState("");
  const [tags, setTags] = useState([]);
  const [error, setError] = useState("");

  async function loadTags() {
    setError("");
    try {
      if (!email) return setError("Enter owner email to load tags");
      const res = await fetch(`/api/tags?owner=${encodeURIComponent(email)}`);
      if (!res.ok) {
        setError("Failed to load tags");
        setTags([]);
        return;
      }
      const data = await res.json();
      setTags(data);
    } catch (err) {
      setError("Failed to load tags");
+      setTags([]);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Client Dashboard</h1>

      <div style={{ marginBottom: 12 }}>
        <input placeholder="Owner email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={loadTags}>Load My Tags</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {tags.map((tag) => (
          <li key={tag.slug}>
            <a href={`/tag/${tag.slug}`}>{tag.slug}</a> — {tag.name || "(no name)"}
          </li>
        ))}
      </ul>
    </div>
  );
}
