"use client";
import { useState } from "react";

export default function Dashboard() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [client, setClient] = useState(null);

  async function login() {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });
    const data = await res.json();
    if (data.success) {
      setClient(data);
    } else {
      alert(data.error || "Login failed");
    }
  }

  async function updateTag(tagId, newData) {
    const res = await fetch(`/api/tags/${tagId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    });
    if (res.ok) {
      alert("Tag updated!");
    } else {
      alert("Update failed");
    }
  }

  if (!client) {
    return (
      <main>
        <h1>Login</h1>
        <input
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={login}>Login</button>
      </main>
    );
  }

  return (
    <main>
      <h1>Welcome {client.client.name}</h1>
      <h2>Your Tags</h2>
      {client.tags.map((tag) => (
        <div key={tag.id} style={{ marginBottom: "1rem" }}>
          <h3>{tag.slug}</h3>
          <label>
            Name:{" "}
            <input
              defaultValue={tag.name}
              onBlur={(e) =>
                updateTag(tag.id, { ...tag, name: e.target.value })
              }
            />
          </label>
          <br />
          <label>
            Phone 1:{" "}
            <input
              defaultValue={tag.phone1}
              onBlur={(e) =>
                updateTag(tag.id, { ...tag, phone1: e.target.value })
              }
            />
          </label>
          <br />
          <label>
            Phone 2:{" "}
            <input
              defaultValue={tag.phone2}
              onBlur={(e) =>
                updateTag(tag.id, { ...tag, phone2: e.target.value })
              }
            />
          </label>
          <br />
          <label>
            Address:{" "}
            <input
              defaultValue={tag.address}
              onBlur={(e) =>
                updateTag(tag.id, { ...tag, address: e.target.value })
              }
            />
          </label>
        </div>
      ))}
    </main>
  );
}