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
      const res = await fetch(`/api/client/tags/${tagId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-client-name": name,
          "x-client-password": password
        },
        body: JSON.stringify({ 
            name: newData.name,
            phone1: newData.phone1,
            phone2: newData.phone2,
            address: newData.address,
            url: newData.url
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
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-lg">
          <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">Client Login</h1>
          
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-red-600 text-sm">
              {error}
            </div>
          )}
            
            <div className="mb-4">
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 touch-manipulation"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 touch-manipulation"
            />
          </div>
          
          <button 
            onClick={login} 
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 text-base font-medium text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200 touch-manipulation"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          
          <div className="mt-4 text-center">
            <a href="/client/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">
              Forgot Password?
            </a>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline font-medium">
              Register here
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Welcome, {client.client.name}</h1>
          <button 
            onClick={() => setClient(null)} 
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300 transition-colors duration-200 touch-manipulation self-start sm:self-auto"
          >
            Logout
          </button>
        </div>
      
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600 text-sm">
            {error}
          </div>
        )}
        
        {saveSuccess && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-600 text-sm">
            {saveSuccess}
          </div>
        )}
      
        <h2 className="mb-6 text-xl font-semibold text-gray-800">Your Tags</h2>
        
        {!client.tags || client.tags?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-base">You don&apos;t have any tags yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {client.tags?.map((tag) => (
              <div key={tag.id} className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-800">{tag.slug}</h3>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    ID: {tag.id}
                  </span>
                </div>
                
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); updateTag(tag.id, tagForms[tag.id]); }}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        value={tagForms[tag.id]?.name || ""}
                        onChange={(e) => handleInputChange(tag.id, 'name', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 touch-manipulation"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Phone 1
                      </label>
                      <input
                        type="tel"
                        value={tagForms[tag.id]?.phone1 || ""}
                        onChange={(e) => handleInputChange(tag.id, 'phone1', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 touch-manipulation"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Phone 2
                      </label>
                      <input
                        type="tel"
                        value={tagForms[tag.id]?.phone2 || ""}
                        onChange={(e) => handleInputChange(tag.id, 'phone2', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 touch-manipulation"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <textarea
                        value={tagForms[tag.id]?.address || ""}
                        onChange={(e) => handleInputChange(tag.id, 'address', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 touch-manipulation resize-none"
                        rows="3"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
                    <a 
                      href={`/public-tag/${tag.slug}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium touch-manipulation"
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
              </div>
            ))}
          </div>
        )}
       </div>
     </div>
   );
}

