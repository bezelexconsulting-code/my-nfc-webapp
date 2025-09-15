"use client";
import React, { useState, useEffect } from "react";

export default function ClientTagPage({ params }) {
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone1: "", phone2: "", address: "", password: "", owner: "" });
  const [message, setMessage] = useState({ type: "", text: "" }); // type: 'error' or 'success'

  useEffect(() => {
    let mounted = true;

    const fetchTag = async () => {
      try {
        const p = await params;
        const slug = p?.slug;
        if (!slug) {
          if (mounted) {
            setMessage({ type: "error", text: "No tag slug provided." });
            setLoading(false);
          }
          return;
        }

        const res = await fetch(`/api/${slug}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: "Tag not found" }));
          if (mounted) {
            setMessage({ type: "error", text: errData.error });
            setLoading(false);
          }
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
            owner: data.owner || "",
          });
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setMessage({ type: "error", text: "Failed to fetch tag data." });
          setLoading(false);
        }
      }
    };

    fetchTag();

    return () => {
      mounted = false;
    };
  }, [params]);

  async function save() {
    setMessage({ type: "", text: "" });
    try {
      const p = await params;
      const slug = p?.slug;
      if (!slug) {
        setMessage({ type: "error", text: "Missing tag slug." });
        return;
      }

      const res = await fetch(`/api/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const resData = await res.json();

      if (res.ok) {
        setTag(resData);
        setMessage({ type: "success", text: "Tag updated successfully!" });
      } else {
        setMessage({ type: "error", text: resData.error || "Failed to update tag." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <h1>Edit Tag: {tag?.slug || ""}</h1>
      
      {message.text && (
        <p style={{ color: message.type === 'error' ? 'red' : 'green' }}>
          {message.text}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Phone 1" value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} />
        <input placeholder="Phone 2" value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} />
        <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input placeholder="Owner Email (for claiming)" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} disabled={tag?.claimed} />
        <input type="password" placeholder="Password (required to claim or update)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button onClick={save} style={{ padding: '10px', cursor: 'pointer' }}>Save / Claim</button>
      </div>

      {tag && (
        <details style={{ marginTop: '20px' }}>
          <summary>Current Tag Data (JSON)</summary>
          <pre style={{ backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '5px' }}>
            {JSON.stringify(tag, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
