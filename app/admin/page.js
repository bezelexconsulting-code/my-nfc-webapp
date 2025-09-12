"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [tags, setTags] = useState([]);
  const [passwordInput, setPasswordInput] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "secret123";

  useEffect(() => {
    if (isLoggedIn) {
      fetch("/api/tags")
        .then(res => res.json())
        .then(setTags);
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Admin Login</h1>
        <input
          type="password"
          placeholder="Password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          className="border p-2 w-full rounded mb-2"
        />
        <button onClick={() => passwordInput === adminPassword ? setIsLoggedIn(true) : alert("Wrong password")} className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard (Read-Only)</h1>
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Slug</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Phone 1</th>
            <th className="p-2 border">Phone 2</th>
            <th className="p-2 border">Address</th>
            <th className="p-2 border">Claimed</th>
          </tr>
        </thead>
        <tbody>
          {tags.map(tag => (
            <tr key={tag.slug}>
              <td className="p-2 border">{tag.slug}</td>
              <td className="p-2 border">{tag.name}</td>
              <td className="p-2 border">{tag.phone1}</td>
              <td className="p-2 border">{tag.phone2}</td>
              <td className="p-2 border">{tag.address}</td>
              <td className="p-2 border">{tag.claimed ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => setIsLoggedIn(false)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Logout</button>
    </div>
  );
}