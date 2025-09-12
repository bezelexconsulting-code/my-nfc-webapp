"use client";

import { useState, useEffect } from "react";

export default function ClientTagPage({ params }) {
  const { slug } = params;
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone1: "",
    phone2: "",
    address: "",
    password: ""
  });

  // Load tag data
  useEffect(() => {
    async function loadTag() {
      const res = await fetch(`/api/tags/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setTag(data);
        if (data.claimed) {
          setForm({
            name: data.name,
            phone1: data.phone1,
            phone2: data.phone2,
            address: data.address,
            password: ""
          });
        }
      } else {
        setTag(null);
      }
      setLoading(false);
    }
    loadTag();
  }, [slug]);

  // Handle claim/edit submission
  async function handleSubmit(e) {
    e.preventDefault();
    if (tag.claimed && !isOwner) {
      alert("Incorrect password!");
      return;
    }

    const updatedTag = {
      ...tag,
      ...form,
      claimed: true,
      password: tag.claimed ? tag.password : form.password
    };

    const res = await fetch(`/api/tags/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTag)
    });

    if (res.ok) {
      alert("Saved successfully!");
      setTag(updatedTag);
      setIsOwner(true);
      setForm({ ...form, password: "" });
    } else {
      alert("Failed to save.");
    }
  }

  function handleLoginPassword(e) {
    e.preventDefault();
    if (passwordInput === tag.password) {
      setIsOwner(true);
    } else {
      alert("Wrong password!");
    }
  }

  if (loading) return <p className="p-4">Loading...</p>;
  if (!tag) return <p className="p-4 text-red-500">Tag not found.</p>;

  // If claimed and not owner, show password login
  if (tag.claimed && !isOwner) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Enter Tag Password</h1>
        <form onSubmit={handleLoginPassword}>
          <input
            type="password"
            placeholder="Tag password"
            className="border p-2 w-full rounded mb-2"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Login
          </button>
        </form>
      </div>
    );
  }

  // Show claim/edit form
  return (
    <div className="p-4 max-w-md mx-auto border rounded shadow-sm">
      <h1 className="text-xl font-bold mb-4">
        {tag.claimed ? "Edit Tag Info" : "Claim Tag"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Name"
          className="border p-2 w-full rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Phone 1"
          className="border p-2 w-full rounded"
          value={form.phone1}
          onChange={(e) => setForm({ ...form, phone1: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Phone 2"
          className="border p-2 w-full rounded"
          value={form.phone2}
          onChange={(e) => setForm({ ...form, phone2: e.target.value })}
        />
        <input
          type="text"
          placeholder="Address"
          className="border p-2 w-full rounded"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        {!tag.claimed && (
          <input
            type="password"
            placeholder="Set a password"
            className="border p-2 w-full rounded"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        )}
        <button className="bg-green-500 text-white px-4 py-2 rounded w-full">
          {tag.claimed ? "Save Changes" : "Claim Tag"}
        </button>
      </form>
    </div>
  );
}