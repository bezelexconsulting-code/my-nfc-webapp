"use client";
import { useState, useEffect } from "react";

export default function ClientTagPage({ params }) {
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone1: "", phone2: "", address: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/${params.slug}`)
      .then((res) => res.json())
      .then((data) => {
        setTag(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.slug]);

  async function save() {
    setError("");
    const res = await fetch(`/api/${params.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated = await res.json();
      setTag(updated);
    } else {
      const text = await res.text();
      setError(text);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Edit Tag: {params.slug}</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Phone 1" value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} />
      <input placeholder="Phone 2" value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} />
      <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

      <button onClick={save}>Save</button>

      {tag && (
        <pre style={{ marginTop: 20 }}>{JSON.stringify(tag, null, 2)}</pre>
      )}
    </div>
  );
}
