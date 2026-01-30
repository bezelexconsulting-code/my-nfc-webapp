"use client";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import WelcomeTutorial from "../../../components/WelcomeTutorial";
import AppUnlockGate from "../../../components/AppUnlockGate";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tagForms, setTagForms] = useState({});
  const [saveSuccess, setSaveSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name, dateCreated, dateUpdated
  const [filteredTags, setFilteredTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState({});

  // Load client + tags when session exists (session cookie sent automatically)
  useEffect(() => {
    if (status !== "authenticated" || !session) {
      setClient(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/client/me", { credentials: "include" });
      const data = await res.json();
      if (cancelled) return;
      if (data.success && data.client) {
        setClient({
          client: data.client,
          tags: data.tags || [],
          tagCount: data.client.tagCount ?? (data.tags?.length ?? 0),
        });
      } else {
        setClient(null);
      }
    })();
    return () => { cancelled = true; };
  }, [session, status]);

  useEffect(() => {
    if (client && client.tags) {
      const forms = {};
      client.tags.forEach(tag => {
        forms[tag.id] = { ...tag };
      });
      setTagForms(forms);
    }
  }, [client]);

  // Filter and sort tags
  useEffect(() => {
    if (!client || !client.tags) {
      setFilteredTags([]);
      return;
    }

    let filtered = [...client.tags];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tag =>
        tag.name?.toLowerCase().includes(query) ||
        tag.slug?.toLowerCase().includes(query) ||
        tag.phone1?.toLowerCase().includes(query) ||
        tag.address?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "dateCreated":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "dateUpdated":
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        default:
          return 0;
      }
    });

    setFilteredTags(filtered);
  }, [client, searchQuery, sortBy]);

  async function loginWithCredentials(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        name: typeof name === "string" ? name.trim() : name,
        password: typeof password === "string" ? password.trim() : password,
        redirect: false,
      });
      if (result?.error) {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  }

  function loginWithGoogle() {
    setError("");
    signIn("google", { callbackUrl: "/client/dashboard" });
  }

  async function handleImageUpload(tagId, file) {
    if (!file) return;

    setUploadingImage(prev => ({ ...prev, [tagId]: true }));
    setError("");

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/client/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      const updateRes = await fetch(`/api/client/tags/${tagId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ imageUrl: data.url }),
      });

      if (updateRes.ok) {
        const updatedTag = await updateRes.json();
        setClient(prev => ({
          ...prev,
          tags: prev.tags.map(tag => tag.id === tagId ? updatedTag : tag)
        }));
        setTagForms(prev => ({
          ...prev,
          [tagId]: { ...prev[tagId], imageUrl: data.url }
        }));
        setSaveSuccess("Image uploaded successfully!");
      } else {
        throw new Error("Failed to update tag with image");
      }
    } catch (err) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(prev => ({ ...prev, [tagId]: false }));
    }
  }

  async function updateTag(tagId, newData) {
    setLoading(true);
    setError("");
    setSaveSuccess("");
    try {
      const res = await fetch(`/api/client/tags/${tagId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          name: newData.name ?? "",
          phone1: newData.phone1 ?? "",
          phone2: newData.phone2 ?? "",
          address: newData.address ?? "",
          url: newData.url ?? "",
          instructions: newData.instructions ?? "",
          imageUrl: newData.imageUrl ?? undefined,
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

  function toggleTagSelection(tagId) {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  }

  function selectAllTags() {
    const tagsToSelect = searchQuery ? filteredTags : client.tags;
    setSelectedTags(new Set(tagsToSelect.map(tag => tag.id)));
  }

  function deselectAllTags() {
    setSelectedTags(new Set());
  }

  async function bulkDeleteTags() {
    if (selectedTags.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedTags.size} tag(s)? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const deletePromises = Array.from(selectedTags).map(tagId =>
        fetch(`/api/client/tags/${tagId}`, {
          method: "DELETE",
          credentials: 'include',
        })
      );

      const results = await Promise.all(deletePromises);
      const failed = results.filter(r => !r.ok);
      
      if (failed.length > 0) {
        throw new Error(`Failed to delete ${failed.length} tag(s)`);
      }

      const res = await fetch("/api/client/me", { credentials: "include" });
      const data = await res.json();
      if (data.success && data.client) {
        setClient({
          client: data.client,
          tags: data.tags || [],
          tagCount: data.client.tagCount ?? (data.tags?.length ?? 0),
        });
        setSelectedTags(new Set());
        setBulkMode(false);
        setSaveSuccess(`${selectedTags.size} tag(s) deleted successfully!`);
      }
    } catch (err) {
      setError(err.message || "Failed to delete tags");
    } finally {
      setLoading(false);
    }
  }

  // Loading session
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  // Loading client after session
  if (session && !client) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
      </div>
    );
  }

  // Login form when not authenticated
  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-lg">
          <h1 className="mb-6 text-2xl font-bold text-center text-gray-800 dark:text-white">Client Login</h1>
          
          {error && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-3 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full mb-4 flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors touch-manipulation"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">or</span>
            </div>
          </div>
            
          <form onSubmit={loginWithCredentials}>
            <div className="mb-4">
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username or email
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your username or email"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 touch-manipulation"
              />
            </div>
          
            <div className="mb-6">
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 touch-manipulation"
              />
            </div>
          
            <button 
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 p-3 text-base font-medium text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200 touch-manipulation"
            >
              {loading ? "Logging in..." : "Login with password"}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <a href="/client/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Forgot Password?
            </a>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Register here
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppUnlockGate>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <WelcomeTutorial 
        tagCount={client.tags?.length || 0}
        onComplete={() => {}}
      />
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Welcome, {client.client.name}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Tags: <span className="font-semibold">{client.tagCount || client.tags?.length || 0}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/client/settings"
              className="rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white px-4 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 touch-manipulation"
            >
              Settings
            </a>
            <button 
              onClick={() => signOut({ callbackUrl: "/client/dashboard" })} 
              className="rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white px-4 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 touch-manipulation"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Email Verification Banner */}
        {client.client.email && !client.client.emailVerified && (
          <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">Verify Your Email</h3>
                <p className="text-sm text-yellow-700">
                  Please verify your email address ({client.client.email}) to unlock all features.
                </p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/client/verify-email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: client.client.email }),
                    });
                    const data = await response.json();
                    alert(data.message || 'Verification email sent!');
                  } catch (err) {
                    alert('Failed to resend verification email.');
                  }
                }}
                className="ml-4 text-sm text-yellow-800 hover:text-yellow-900 underline font-medium"
              >
                Resend
              </button>
            </div>
          </div>
        )}
      
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        
        {saveSuccess && (
          <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 text-green-600 dark:text-green-400 text-sm">
            {saveSuccess}
          </div>
        )}

        {/* Search and Filter Bar */}
        {client.tags && client.tags.length > 0 && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search tags by name, slug, phone, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="name">Sort by Name</option>
                  <option value="dateCreated">Newest First</option>
                  <option value="dateUpdated">Recently Updated</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              {searchQuery && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredTags.length} of {client.tags.length} tags
                </p>
              )}
              <div className="flex gap-2 ml-auto">
                {!bulkMode ? (
                  <button
                    onClick={() => setBulkMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Bulk Select
                  </button>
                ) : (
                  <>
                    <button
                      onClick={selectAllTags}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAllTags}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
                    >
                      Deselect All
                    </button>
                    {selectedTags.size > 0 && (
                      <button
                        onClick={bulkDeleteTags}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 transition-colors duration-200 text-sm font-medium"
                      >
                        Delete ({selectedTags.size})
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setBulkMode(false);
                        setSelectedTags(new Set());
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      
        <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">Your Tags</h2>
        
        {!client.tags || client.tags?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-base">You don&apos;t have any tags yet.</p>
          </div>
        ) : filteredTags.length === 0 && searchQuery ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-base">No tags found matching your search.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {(searchQuery ? filteredTags : client.tags)?.map((tag) => (
              <div key={tag.id} className={`rounded-lg border ${bulkMode && selectedTags.has(tag.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm`}>
                {bulkMode && (
                  <div className="mb-4">
                    <input
                      type="checkbox"
                      checked={selectedTags.has(tag.id)}
                      onChange={() => toggleTagSelection(tag.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                )}
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">{tag.slug}</h3>
                  <span className="rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-1 text-xs text-blue-800 dark:text-blue-200">
                    ID: {tag.id}
                  </span>
                </div>
                
                {!bulkMode && (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); updateTag(tag.id, tagForms[tag.id]); }}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Name
                      </label>
                      <input
                        type="text"
                        value={tagForms[tag.id]?.name || ""}
                        onChange={(e) => handleInputChange(tag.id, 'name', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 touch-manipulation"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone 1
                      </label>
                      <input
                        type="tel"
                        value={tagForms[tag.id]?.phone1 || ""}
                        onChange={(e) => handleInputChange(tag.id, 'phone1', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 touch-manipulation"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone 2
                      </label>
                      <input
                        type="tel"
                        value={tagForms[tag.id]?.phone2 || ""}
                        onChange={(e) => handleInputChange(tag.id, 'phone2', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 touch-manipulation"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Address <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        value={tagForms[tag.id]?.address || ""}
                        onChange={(e) => handleInputChange(tag.id, 'address', e.target.value)}
                        placeholder="Enter address (optional)"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 touch-manipulation resize-none"
                        rows="3"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Instructions
                      </label>
                      <textarea
                        value={tagForms[tag.id]?.instructions || ""}
                        onChange={(e) => handleInputChange(tag.id, 'instructions', e.target.value)}
                        placeholder="Add instructions for visitors..."
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 touch-manipulation resize-none"
                        rows="3"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Image <span className="text-gray-500 font-normal">(optional)</span>
                      </label>
                      {tagForms[tag.id]?.imageUrl && (
                        <div className="mb-3">
                          <img
                            src={tagForms[tag.id].imageUrl}
                            alt="Tag preview"
                            className="max-w-xs h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(tag.id, file);
                          }
                        }}
                        disabled={uploadingImage[tag.id]}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 touch-manipulation"
                      />
                      {uploadingImage[tag.id] && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Uploading image...</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Max file size: 5MB. Supported formats: JPEG, PNG, GIF, WebP
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <a 
                      href={`/public-tag/${tag.slug}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium touch-manipulation"
                    >
                      View Public Page →
                    </a>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200 touch-manipulation"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
                )}
              </div>
            ))}
          </div>
        )}
       </div>
     </div>
    </AppUnlockGate>
   );
}