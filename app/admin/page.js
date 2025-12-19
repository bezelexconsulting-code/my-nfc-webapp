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
  
  // Client Search State
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [selectedClientForView, setSelectedClientForView] = useState(null);
  const [filteredClients, setFilteredClients] = useState([]);
  const [clientTags, setClientTags] = useState([]);

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

  // Filter clients based on search query
  useEffect(() => {
    if (clientSearchQuery.trim() === "") {
      setFilteredClients([]);
    } else {
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(clientSearchQuery.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [clientSearchQuery, clients]);

  // Load tags for selected client
  const loadClientTags = useCallback(async (clientId, adminToken) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/tags?clientId=${clientId}`, {
        headers: { "x-admin-token": adminToken },
      });
      if (!res.ok) {
        const txt = await res.text();
        setError(txt || "Failed to load client tags");
        setClientTags([]);
        return;
      }
      const data = await res.json();
      setClientTags(data);
    } catch (err) {
      setError("Failed to load client tags");
      setClientTags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClientSelect = (client) => {
    setSelectedClientForView(client);
    setClientSearchQuery(client.name);
    setFilteredClients([]);
    loadClientTags(client.id, token);
  };

  const clearClientSelection = () => {
    setSelectedClientForView(null);
    setClientSearchQuery("");
    setClientTags([]);
  };

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

  // Delete tag function
  async function deleteTag(tagId) {
    if (!confirm("Are you sure you want to delete this tag? This action cannot be undone.")) {
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/tags/${tagId}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });
      if (!res.ok) {
        const errorMsg = await getErrorFromResponse(res);
        setError(errorMsg);
      } else {
        await loadTags(token); // Reload all tags
        // If we're viewing client tags, reload those too
        if (selectedClientForView) {
          await loadClientTags(selectedClientForView.id, token);
        }
      }
    } catch (err) {
      setError("Failed to delete tag");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              localStorage.removeItem("adminUsername");
              setIsAuthenticated(false);
              router.push("/admin/login");
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors duration-200 touch-manipulation text-sm font-medium"
          >
            Logout
          </button>
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg sm:text-xl font-semibold text-gray-800">Admin Status</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-lg">✓</span>
                  <span className="text-sm sm:text-base text-gray-700">Logged in as: {localStorage.getItem("adminUsername")}</span>
                </div>
              ) : (
                <span className="text-red-600">Not authenticated</span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-600 text-sm">{error}</div>
        )}

        {isAuthenticated && (
          <>
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
              <h2 className="mb-4 text-lg sm:text-xl font-semibold text-gray-800">Add New Tag</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Client</label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 touch-manipulation"
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
                  <label className="mb-2 block text-sm font-medium text-gray-700">Tag Slug</label>
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="e.g., my-first-tag-123"
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 touch-manipulation"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    A unique identifier for the tag. Use letters, numbers, and hyphens.
                  </p>
                </div>

                <button
                  onClick={addTag}
                  disabled={loading || !selectedClient || !newTag.trim()}
                  className="w-full sm:w-auto rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-200 disabled:bg-green-300 transition-colors duration-200 touch-manipulation"
                >
                  {loading ? "Adding..." : "Add Tag"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
                <h2 className="mb-4 text-lg sm:text-xl font-semibold text-gray-800">Manage Clients</h2>
                <div className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-800">Add New Client</h3>
                  <input
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Client Name"
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 touch-manipulation"
                  />
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="Client Email"
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 touch-manipulation"
                  />
                  <input
                    type="password"
                    value={newClientPassword}
                    onChange={(e) => setNewClientPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 touch-manipulation"
                  />
                  <button
                    onClick={addClient}
                    disabled={loading || !newClientName.trim() || !newClientEmail.trim() || !newClientPassword.trim()}
                    className="w-full sm:w-auto rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 disabled:bg-blue-300 transition-colors duration-200 touch-manipulation"
                  >
                    {loading ? "Adding..." : "Add Client"}
                  </button>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-gray-800">All Clients</h3>
                  {clients.length === 0 ? (
                    <p className="text-gray-500 text-sm">No clients found.</p>
                  ) : (
                    <ul className="space-y-3">
                      {clients.map((client) => (
                        <li key={client.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                          {editingClient?.id === client.id ? (
                            <>
                              <div className="flex-grow space-y-3 w-full sm:w-auto">
                                <input
                                  value={editingClient.name}
                                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 touch-manipulation"
                                  placeholder="Client Name"
                                />
                                <input
                                  type="email"
                                  value={editingClient.email}
                                  onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 touch-manipulation"
                                  placeholder="Client Email"
                                />
                              </div>
                              <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                                <button onClick={updateClient} className="flex-1 sm:flex-none rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors duration-200 touch-manipulation">Save</button>
                                <button onClick={() => setEditingClient(null)} className="flex-1 sm:flex-none rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 transition-colors duration-200 touch-manipulation">Cancel</button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex-grow">
                                <p className="font-semibold text-gray-800">{client.name}</p>
                                <p className="text-sm text-gray-600">{client.email}</p>
                                <p className="text-xs text-gray-500 mt-1">Tags: {client._count?.tags ?? 0}</p>
                              </div>
                              <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                                <button
                                  onClick={() => setEditingClient({ id: client.id, name: client.name, email: client.email })}
                                  className="flex-1 sm:flex-none rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 transition-colors duration-200 touch-manipulation"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteClient(client.id)}
                                  className="flex-1 sm:flex-none rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors duration-200 touch-manipulation"
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

            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
              <h2 className="mb-4 text-lg sm:text-xl font-semibold text-gray-800">View Client Tags</h2>
              
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">Search Client</label>
                <div className="relative">
                  <input
                    type="text"
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    placeholder="Type client name or email..."
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 touch-manipulation"
                  />
                  {selectedClientForView && (
                    <button
                      onClick={clearClientSelection}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {/* Search Results Dropdown */}
                {filteredClients.length > 0 && !selectedClientForView && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => handleClientSelect(client)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                      >
                        <div className="font-medium text-gray-800">{client.name}</div>
                        <div className="text-sm text-gray-600">{client.email}</div>
                        <div className="text-xs text-gray-500">Tags: {client._count?.tags ?? 0}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Client Tags Display */}
              {selectedClientForView && (
                <div className="mb-6">
                  <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <h3 className="font-semibold text-blue-800 mb-1">{selectedClientForView.name}</h3>
                    <p className="text-sm text-blue-600">{selectedClientForView.email}</p>
                    <p className="text-xs text-blue-500 mt-1">Total Tags: {clientTags.length}</p>
                  </div>
                  
                  {clientTags.length === 0 ? (
                    <p className="text-gray-500 text-sm">This client has no tags yet.</p>
                  ) : (
                    <>
                      {/* Desktop Table View for Client Tags */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full table-auto">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="p-3 text-left text-sm font-semibold text-gray-700">Slug</th>
                              <th className="p-3 text-left text-sm font-semibold text-gray-700">Name</th>
                              <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                              <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clientTags.map((tag) => (
                              <tr key={tag.slug} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                                <td className="p-3"><strong className="text-gray-800">{tag.slug}</strong></td>
                                <td className="p-3 text-gray-700">{tag.name || "(no name)"}</td>
                                <td className="p-3">
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                      tag.name ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {tag.name ? "Configured" : "Unconfigured"}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex space-x-2">
                                    <a href={`/public-tag/${tag.slug}`} target="_blank" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200">
                                      View
                                    </a>
                                    <button
                                      onClick={() => deleteTag(tag.id)}
                                      className="text-sm text-red-600 hover:text-red-800 hover:underline transition-colors duration-200"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Mobile Card View for Client Tags */}
                      <div className="md:hidden space-y-3">
                        {clientTags.map((tag) => (
                          <div key={tag.slug} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-grow">
                                  <p className="font-semibold text-gray-800">{tag.slug}</p>
                                  <p className="text-sm text-gray-600">{tag.name || "(no name)"}</p>
                                </div>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
                                    tag.name ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {tag.name ? "Configured" : "Unconfigured"}
                                </span>
                              </div>
                              <div className="pt-2">
                                <a 
                                  href={`/public-tag/${tag.slug}`} 
                                  target="_blank" 
                                  className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors duration-200 touch-manipulation"
                                >
                                  View Tag
                                </a>
                                <button
                                  onClick={() => deleteTag(tag.id)}
                                  className="inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors duration-200 touch-manipulation"
                                >
                                  Delete
                                </button>
                                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
                <h2 className="mb-4 text-lg sm:text-xl font-semibold text-gray-800">All Tags</h2>
                {tags.length === 0 ? (
                  <p className="text-gray-500 text-sm">No tags found.</p>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Slug</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Name</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Client</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tags.map((tag) => (
                            <tr key={tag.slug} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                              <td className="p-3"><strong className="text-gray-800">{tag.slug}</strong></td>
                              <td className="p-3 text-gray-700">{tag.name || "(no name)"}</td>
                              <td className="p-3 text-gray-700">{tag.client?.name || "Unknown"}</td>
                              <td className="p-3">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    tag.name ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {tag.name ? "Configured" : "Unconfigured"}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <a href={`/public-tag/${tag.slug}`} target="_blank" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200">
                                    View
                                  </a>
                                  <button
                                    onClick={() => deleteTag(tag.id)}
                                    className="text-sm text-red-600 hover:text-red-800 hover:underline transition-colors duration-200"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                      {tags.map((tag) => (
                        <div key={tag.slug} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-grow">
                                <p className="font-semibold text-gray-800">{tag.slug}</p>
                                <p className="text-sm text-gray-600">{tag.name || "(no name)"}</p>
                                <p className="text-sm text-gray-600">Client: {tag.client?.name || "Unknown"}</p>
                              </div>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
                                  tag.name ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {tag.name ? "Configured" : "Unconfigured"}
                              </span>
                            </div>
                            <div className="pt-2">
                              <div className="flex space-x-2">
                                <a 
                                  href={`/public-tag/${tag.slug}`} 
                                  target="_blank" 
                                  className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors duration-200 touch-manipulation"
                                >
                                  View Tag
                                </a>
                                <button
                                  onClick={() => deleteTag(tag.id)}
                                  className="inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors duration-200 touch-manipulation"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}