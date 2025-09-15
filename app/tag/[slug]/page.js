"use client";
import React, { useState, useEffect } from "react";

export default function ClientTagPage({ params }) {
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone1: "", phone2: "", address: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const p = await params;
        const slug = p?.slug;
        if (!slug) {
          if (mounted) setLoading(false);
          return;
        }

        const res = await fetch(`/api/${slug}`);
        if (!res.ok) {
          if (mounted) setLoading(false);
          return;
        }

        const data = await res.json();
        if (mounted) {
          setTag(data);
          setForm({
            name: data.name || "",
            phone1: data.phone1 || "",
            phone2: data.phone2 || "",
            address: data.address || "",
            password: "",
          });
          setLoading(false);
        }
      } catch (err) {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [params]);

  async function save() {
    setError("");
    try {
      const p = await params;
      const slug = p?.slug;
      if (!slug) return setError("Missing tag slug");

      const res = await fetch(`/api/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const updated = await res.json();
        setTag(updated);
        setError("");
      } else {
        const text = await res.text();
        setError(text);
      }
    } catch (err) {
      setError("Failed to save tag");
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Edit Tag: {tag?.slug || ""}</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input placeholder="Owner email (for claiming)" value={form.owner || ""} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
      <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Phone 1" value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} />
      <input placeholder="Phone 2" value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} />
      <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

      <button onClick={save}>Save / Claim</button>

      {tag && (
        <pre style={{ marginTop: 20 }}>{JSON.stringify(tag, null, 2)}</pre>
      )}
    </div>
  );
}
