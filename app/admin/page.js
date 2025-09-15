"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  async function loadTags() {
    setError("");
    try {
      const res = await fetch("/api/tags", { headers: { "x-admin-token": token } });
      if (!res.ok) {
        const txt = await res.text();
        setError(txt || "Failed to load tags");
        setTags([]);
        return;
      }
      const data = await res.json();
      setTags(data);
    } catch (err) {
      setError("Failed to load tags");
    }
  }

  useEffect(() => {
    if (token) loadTags();
  }, [token]);

  async function addTag() {
    if (!newTag.trim()) return;
    setError("");
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ slug: newTag }),
      });
      if (!res.ok) {
        const txt = await res.text();
        setError(txt || "Failed to create tag");
        return;
      }
      const created = await res.json();
      setTags((prev) => [...prev, created]);
      setNewTag("");
    } catch (err) {
      setError("Failed to create tag");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      <div style={{ marginBottom: 12 }}>
        <input placeholder="Admin token" value={token} onChange={(e) => setToken(e.target.value)} />
        <button onClick={loadTags}>Load Tags</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: 12 }}>
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Enter new tag slug"
        />
        <button onClick={addTag}>Add Tag</button>
      </div>

      <ul>
        {tags.map((tag) => (
          <li key={tag.slug}>
            <strong>{tag.slug}</strong> — {tag.name || "(no name)"} {tag.claimed ? "(claimed)" : "(unclaimed)"}
          </li>
        ))}
      </ul>
    </div>
  );
}
