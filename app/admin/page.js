"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then(setTags)
      .catch(console.error);
  }, []);

  async function addTag() {
    if (!newTag.trim()) return;
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: newTag }),
    });
    if (res.ok) {
      const created = await res.json();
      setTags((prev) => [...prev, created]);
      setNewTag("");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>
      <input
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        placeholder="Enter new tag slug"
      />
      <button onClick={addTag}>Add Tag</button>

      <ul>
        {tags.map((tag) => (
          <li key={tag.slug}>
            {tag.slug} {tag.claimed ? "(claimed)" : "(unclaimed)"}
          </li>
        ))}
      </ul>
    </div>
  );
}
