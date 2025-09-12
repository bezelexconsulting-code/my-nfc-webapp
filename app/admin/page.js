"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [tags, setTags] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const adminPassword = 
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_ADMIN_PASSWORD
      : null;

  useEffect(() => {
    if (isLoggedIn) fetchTags();
  }, [isLoggedIn]);

  async function fetchTags() {
    const res = await fetch("/api/tags");
    const data = await res.json();
    setTags(data);
  }

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === adminPassword) setIsLoggedIn(true);
    else alert("Incorrect password!");
  };

  if (!isLoggedIn)
    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Admin Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Admin password"
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

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard (Read-Only)</h1>
      <button
        onClick={() => setIsLoggedIn(false)}
        className="bg-red-500 text-white px-4 py-2 rounded mb-4"
      >
        Logout
      </button>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Slug</th>
            <th className="p-2 border">Owner</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Phone 1</th>
            <th className="p-2 border">Phone 2</th>
            <th className="p-2 border">Address</th>
            <th className="p-2 border">Claimed</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr key={tag.slug} className="border">
              <td className="p-2 border">{tag.slug}</td>
              <td className="p-2 border">{tag.owner || "-"}</td>
              <td className="p-2 border">{tag.name || "-"}</td>
              <td className="p-2 border">{tag.phone1 || "-"}</td>
              <td className="p-2 border">{tag.phone2 || "-"}</td>
              <td className="p-2 border">{tag.address || "-"}</td>
              <td className="p-2 border">{tag.claimed ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}