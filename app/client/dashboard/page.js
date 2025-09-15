"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tagForms, setTagForms] = useState({});
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    if (client && client.tags) {
      const forms = {};
      client.tags.forEach(tag => {
        forms[tag.id] = { ...tag };
      });
      setTagForms(forms);
    }
  }, [client]);

  async function login() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();
      if (data.success) {
        setClient(data);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  }

  async function updateTag(tagId, newData) {
    setLoading(true);
    setError("");
    setSaveSuccess("");
    try {
      const res = await fetch(`/api/tags/${tagId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            name: newData.name,
            phone1: newData.phone1,
            phone2: newData.phone2,
            address: newData.address
        }),
      });
      
      if (res.ok) {
        const updatedTag = await res.json();
        setClient(prev => ({
          ...prev,
          tags: prev.tags.map(tag => tag.id === tagId ? updatedTag : tag)
        }));
        setSaveSuccess("Changes saved successfully!");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Update failed");
      }
    } catch (err) {
      setError("An error occurred while updating the tag");
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(tagId, field, value) {
    setTagForms(prev => ({
        ...prev,
        [tagId]: {
            ...prev[tagId],
            [field]: value
        }
    }));
  }

  if (!client) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border p-6 shadow-md">
          <h1 className="mb-6 text-2xl font-bold">Client Login</h1>
          
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-red-500">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Username
            </label>
            <input
              id="name"
              type="text"
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border p-2"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border p-2"
            />
          </div>
          
          <button 
            onClick={login} 
            disabled={loading}
            className="w-full rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Register
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome, {client.client.name}</h1>
        <button 
          onClick={() => setClient(null)} 
          className="rounded-md bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
        >
          Logout
        </button>
      </div>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-red-500">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-green-500">
          {saveSuccess}
        </div>
      )}
      
      <h2 className="mb-4 text-xl font-semibold">Your Tags</h2>
      
      {!client.tags || client.tags?.length === 0 ? (
        <p className="text-gray-500">You don't have any tags yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {client.tags?.map((tag) => (
            <div key={tag.id} className="rounded-lg border p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-medium">{tag.slug}</h3>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                  ID: {tag.id}
                </span>
              </div>
              
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); updateTag(tag.id, tagForms[tag.id]); }}>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Name
                  </label>
                  <input
                    type="text"
                    value={tagForms[tag.id]?.name || ""}
                    onChange={(e) => handleInputChange(tag.id, 'name', e.target.value)}
                    className="w-full rounded-md border p-2 text-sm"
                  />
                </div>
                
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Phone 1
                  </label>
                  <input
                    type="tel"
                    value={tagForms[tag.id]?.phone1 || ""}
                    onChange={(e) => handleInputChange(tag.id, 'phone1', e.target.value)}
                    className="w-full rounded-md border p-2 text-sm"
                  />
                </div>
                
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Phone 2
                  </label>
                  <input
                    type="tel"
                    value={tagForms[tag.id]?.phone2 || ""}
                    onChange={(e) => handleInputChange(tag.id, 'phone2', e.target.value)}
                    className="w-full rounded-md border p-2 text-sm"
                  />
                </div>
                
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Address
                  </label>
                  <textarea
                    value={tagForms[tag.id]?.address || ""}
                    onChange={(e) => handleInputChange(tag.id, 'address', e.target.value)}
                    className="w-full rounded-md border p-2 text-sm"
                    rows="2"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <a 
                    href={`/public-tag/${tag.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Public Page
                  </a>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}