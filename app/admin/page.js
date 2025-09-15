"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [tags, setTags] = useState([]);
  const [clients, setClients] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  async function loadTags() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/tags", { headers: { "x-admin-token": token } });
      if (!res.ok) {
        const txt = await res.text();
        setError(txt || "Failed to load tags");
        setTags([]);
        return;
      }
      const data = await res.json();
      setTags(data);
    } catch (err) {
      setError("Failed to load tags");
    } finally {
      setLoading(false);
    }
  }
  
  async function loadClients() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/clients", { headers: { "x-admin-token": token } });
      if (!res.ok) {
        const txt = await res.text();
        setError(txt || "Failed to load clients");
        setClients([]);
        return;
      }
      const data = await res.json();
      setClients(data);
    } catch (err) {
      setError("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Check if admin is logged in
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      loadTags();
      loadClients();
    } else {
      // Redirect to login if not authenticated
      router.push('/admin/login');
    }
  }, [router]);

  async function addTag() {
    if (!newTag.trim() || !selectedClient) {
      setError("Both tag slug and client are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ 
          slug: newTag,
          clientName: selectedClient 
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        setError(txt || "Failed to create tag");
        return;
      }
      const created = await res.json();
      setTags((prev) => [...prev, created]);
      setNewTag("");
      // Don't reset selectedClient to allow adding multiple tags for the same client
    } catch (err) {
      setError("Failed to create tag");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

      <div className="mb-6 rounded-lg border p-4 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Admin Status</h2>
        <div className="flex items-center justify-between gap-2">
          <div>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Logged in as: {localStorage.getItem('adminUsername')}</span>
              </div>
            ) : (
              <span className="text-red-600">Not authenticated</span>
            )}
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminUsername');
              setIsAuthenticated(false);
              router.push('/admin/login');
            }} 
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-red-500">
          {error}
        </div>
      )}

      {isAuthenticated && (
        <div className="mb-6 rounded-lg border p-4 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Add New Tag</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full rounded-md border p-2"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium">Tag Slug</label>
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter new tag slug"
                className="w-full rounded-md border p-2"
              />
            </div>
            
            <button 
              onClick={addTag} 
              disabled={loading || !selectedClient || !newTag.trim()}
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-green-300"
            >
              {loading ? "Adding..." : "Add Tag"}
            </button>
          </div>
        </div>
      )}

      {token && (
        <div className="rounded-lg border p-4 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">All Tags</h2>
          {tags.length === 0 ? (
            <p className="text-gray-500">No tags found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Slug</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Client</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map((tag) => (
                    <tr key={tag.slug} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <strong>{tag.slug}</strong>
                      </td>
                      <td className="p-2">{tag.name || "(no name)"}</td>
                      <td className="p-2">{tag.client?.name || "Unknown"}</td>
                      <td className="p-2">
                        <span className={`rounded-full px-2 py-1 text-xs ${tag.name ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {tag.name ? "Configured" : "Unconfigured"}
                        </span>
                      </td>
                      <td className="p-2">
                        <a 
                          href={`/public-tag/${tag.slug}`} 
                          target="_blank"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
