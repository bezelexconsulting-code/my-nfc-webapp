"use client";
import React, { useState, useEffect } from "react";

export default function PublicTagPage({ params }) {
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchTag = async () => {
      try {
        const p = await params;
        const slug = p?.slug;
        if (!slug) {
          if (mounted) {
            setError("No tag slug provided.");
            setLoading(false);
          }
          return;
        }

        const res = await fetch(`/api/${slug}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: "Tag not found" }));
          if (mounted) {
            setError(errData.error);
            setLoading(false);
          }
          return;
        }

        const data = await res.json();
        if (mounted) {
          setTag(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to fetch tag data.");
          setLoading(false);
        }
      }
    };
    
    fetchTag();

    return () => {
      mounted = false;
    };
  }, [params]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!tag) return <p>Tag not found</p>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">{tag.name || "NFC Tag"}</h1>
        
        <div className="space-y-4">
          <div className="rounded-md bg-blue-50 p-4">
            <h2 className="mb-2 text-lg font-medium text-blue-800">Contact Information</h2>
            <p className="text-gray-700">
              <strong>Primary:</strong> {tag.phone1 || "Not available"}
            </p>
            {tag.phone2 && (
              <p className="text-gray-700">
                <strong>Secondary:</strong> {tag.phone2}
              </p>
            )}
          </div>
          
          <div className="rounded-md bg-green-50 p-4">
            <h2 className="mb-2 text-lg font-medium text-green-800">Location</h2>
            <p className="text-gray-700">{tag.address || "Address not available"}</p>
          </div>
          
          {tag.url && (
            <div className="rounded-md bg-purple-50 p-4">
              <h2 className="mb-2 text-lg font-medium text-purple-800">Website</h2>
              <a 
                href={tag.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {tag.url}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
