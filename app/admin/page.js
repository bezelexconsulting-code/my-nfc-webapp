"use client";
import { useState, useEffect, useCallback } from "react";
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

  // Client Management State
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPassword, setNewClientPassword] = useState("");
  const [editingClient, setEditingClient] = useState(null); // { id, name, email }

  const loadTags = useCallback(async (adminToken) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/tags", {
        headers: { "x-admin-token": adminToken },
      });
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
  }, []);

  const loadClients = useCallback(async (adminToken) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/clients", {
        headers: { "x-admin-token": adminToken },
      });
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
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      loadTags(storedToken);
      loadClients(storedToken);
    } else {
      router.push("/admin/login");
    }
  }, [router, loadTags, loadClients]);

  const getErrorFromResponse = async (res) => {
    const defaultError = "An unknown error occurred.";
    try {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        return json.error || text || defaultError;
      } catch (e) {
        return text || defaultError;
      }
    } catch (e) {
      return defaultError;
    }
  };

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
          clientName: selectedClient,
        }),
      });
      if (!res.ok) {
        const errorMsg = await getErrorFromResponse(res);
        setError(errorMsg);
        return;
      }
      await loadTags(token); // Reload tags
      setNewTag("");
    } catch (err) {
      setError("Failed to create tag");
    } finally {
      setLoading(false);
    }
  }

  async function addClient() {
    if (!newClientName.trim() || !newClientEmail.trim() || !newClientPassword.trim()) {
      setError("All client fields are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          name: newClientName,
          email: newClientEmail,
          password: newClientPassword,
        }),
      });
      if (!res.ok) {
        const errorMsg = await getErrorFromResponse(res);
        setError(errorMsg);
        return;
      }
      await loadClients(token); // Reload clients
      setNewClientName("");
      setNewClientEmail("");
      setNewClientPassword("");
    } catch (err) {
      setError("Failed to create client");
    } finally {
      setLoading(false);
    }
  }

  async function deleteClient(clientId) {
    if (!confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });
      if (!res.ok) {
        const errorMsg = await getErrorFromResponse(res);
        setError(errorMsg);
      } else {
        await loadClients(token); // Reload clients
      }
    } catch (err) {
      setError("Failed to delete client");
    } finally {
      setLoading(false);
    }
  }

  async function updateClient() {
    if (!editingClient || !editingClient.name.trim() || !editingClient.email.trim()) {
      setError("Client name and email are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${editingClient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          name: editingClient.name,
          email: editingClient.email,
        }),
      });
      if (!res.ok) {
        const errorMsg = await getErrorFromResponse(res);
        setError(errorMsg);
        return;
      }
      await loadClients(token); // Reload clients
      setEditingClient(null);
    } catch (err) {
      setError("Failed to update client");
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
                <span>Logged in as: {localStorage.getItem("adminUsername")}</span>
              </div>
            ) : (
              <span className="text-red-600">Not authenticated</span>
            )}
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              localStorage.removeItem("adminUsername");
              setIsAuthenticated(false);
              router.push("/admin/login");
            }}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-red-500">{error}</div>
      )}

      {isAuthenticated && (
        <>
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
                  placeholder="e.g., my-first-tag-123"
                  className="w-full rounded-md border p-2"
                />
                <p className="mt-1 text-xs text-gray-500">
                  A unique identifier for the tag. Use letters, numbers, and hyphens.
                </p>
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-4 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Manage Clients</h2>
              <div className="mb-6 space-y-4 rounded-md border p-4">
                <h3 className="font-semibold">Add New Client</h3>
                <input
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Client Name"
                  className="w-full rounded-md border p-2"
                />
                <input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="Client Email"
                  className="w-full rounded-md border p-2"
                />
                <input
                  type="password"
                  value={newClientPassword}
                  onChange={(e) => setNewClientPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-md border p-2"
                />
                <button
                  onClick={addClient}
                  disabled={loading || !newClientName.trim() || !newClientEmail.trim() || !newClientPassword.trim()}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {loading ? "Adding..." : "Add Client"}
                </button>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">All Clients</h3>
                {clients.length === 0 ? (
                  <p className="text-gray-500">No clients found.</p>
                ) : (
                  <ul className="space-y-2">
                    {clients.map((client) => (
                      <li key={client.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
                        {editingClient?.id === client.id ? (
                          <>
                            <div className="flex-grow space-y-2">
                              <input
                                value={editingClient.name}
                                onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                                className="w-full rounded-md border p-2 text-sm"
                              />
                              <input
                                type="email"
                                value={editingClient.email}
                                onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                                className="w-full rounded-md border p-2 text-sm"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <button onClick={updateClient} className="rounded-md bg-green-500 px-3 py-1 text-xs text-white">Save</button>
                              <button onClick={() => setEditingClient(null)} className="rounded-md bg-gray-500 px-3 py-1 text-xs text-white">Cancel</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex-grow">
                              <p className="font-bold">{client.name}</p>
                              <p className="text-sm text-gray-600">{client.email}</p>
                              <p className="text-xs text-gray-500">Tags: {client._count?.tags ?? 0}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => setEditingClient({ id: client.id, name: client.name, email: client.email })}
                                className="rounded-md bg-yellow-500 px-3 py-1 text-xs text-white"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteClient(client.id)}
                                className="rounded-md bg-red-600 px-3 py-1 text-xs text-white"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

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
                          <td className="p-2"><strong>{tag.slug}</strong></td>
                          <td className="p-2">{tag.name || "(no name)"}</td>
                          <td className="p-2">{tag.client?.name || "Unknown"}</td>
                          <td className="p-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                tag.name ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {tag.name ? "Configured" : "Unconfigured"}
                            </span>
                          </td>
                          <td className="p-2">
                            <a href={`/public-tag/${tag.slug}`} target="_blank" className="text-sm text-blue-600 hover:underline">
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
          </div>
        </>
      )}
    </div>
  );
}