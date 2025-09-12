"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function TagPage() {
  const params = useParams();
  const { slug } = params;

  const [tag, setTag] = useState(null);
  const [editing, setEditing] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // Load tag
  async function loadTag() {
    const res = await fetch(`/api/tags/${slug}`);
    const data = await res.json();
    setTag(data);
  }

  useEffect(() => {
    loadTag();
  }, [slug]);

  if (!tag) return <div className="p-4">Loading...</div>;

  // Save edits
  async function handleSave(e) {
    e.preventDefault();
    const res = await fetch(`/api/tags/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...tag, claimed: true }),
    });
    const data = await res.json();
    setTag(data);
    setEditing(false);
    alert("Tag info saved!");
  }

  // Login for editing
  function handleLogin(e) {
    e.preventDefault();
    if (!tag.password || passwordInput === tag.password) {
      setEditing(true);
      alert("You can now edit your tag info.");
    } else {
      alert("Wrong password ❌");
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Tag Info</h1>

      {!editing ? (
        <>
          <p><strong>Name:</strong> {tag.name || "-"}</p>
          <p><strong>Phone 1:</strong> {tag.phone1 || "-"}</p>
          <p><strong>Phone 2:</strong> {tag.phone2 || "-"}</p>
          <p><strong>Address:</strong> {tag.address || "-"}</p>

          {tag.password ? (
            <form onSubmit={handleLogin} className="mt-4">
              <input
                type="password"
                placeholder="Enter password to edit"
                className="border p-2 w-full rounded mb-2"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              <button className="bg-blue-500 text-white px-4 py-2 rounded">
                Edit
              </button>
            </form>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-green-500 text-white px-4 py-2 rounded mt-4"
            >
              Claim Tag
            </button>
          )}
        </>
      ) : (
        <form onSubmit={handleSave} className="space-y-2">
          <input
            type="text"
            placeholder="Name"
            className="border p-2 w-full rounded"
            value={tag.name || ""}
            onChange={(e) => setTag({ ...tag, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone 1"
            className="border p-2 w-full rounded"
            value={tag.phone1 || ""}
            onChange={(e) => setTag({ ...tag, phone1: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone 2"
            className="border p-2 w-full rounded"
            value={tag.phone2 || ""}
            onChange={(e) => setTag({ ...tag, phone2: e.target.value })}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-2 w-full rounded"
            value={tag.address || ""}
            onChange={(e) => setTag({ ...tag, address: e.target.value })}
          />
          <input
            type="password"
            placeholder="Set a password for editing"
            className="border p-2 w-full rounded"
            value={tag.password || ""}
            onChange={(e) => setTag({ ...tag, password: e.target.value })}
          />
          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Save
          </button>
        </form>
      )}
    </div>
  );
}