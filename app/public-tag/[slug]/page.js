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

  if (loading) return <p className="text-center text-xl font-semibold text-gray-900 p-8">Loading...</p>;
  if (error) return <p className="text-center text-xl font-semibold text-red-700 p-8">Error: {error}</p>;
  if (!tag) return <p className="text-center text-xl font-semibold text-gray-900 p-8">Tag not found</p>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg border border-gray-200">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">{tag.name || "NFC Tag"}</h1>

        <div className="space-y-6">
          <div className="rounded-md bg-blue-100 p-5 border-2 border-blue-300">
            <h2 className="mb-3 text-xl font-bold text-blue-900">Contact Information</h2>
            <p className="text-gray-900 text-lg mb-2 leading-relaxed">
              <strong className="text-blue-900">Primary:</strong> {tag.phone1 || "Not available"}
            </p>
            {tag.phone2 && (
              <p className="text-gray-900 text-lg leading-relaxed">
                <strong className="text-blue-900">Secondary:</strong> {tag.phone2}
              </p>
            )}
          </div>

          <div className="rounded-md bg-green-100 p-5 border-2 border-green-300">
            <h2 className="mb-3 text-xl font-bold text-green-900">Location</h2>
            <p className="text-gray-900 text-lg leading-relaxed">{tag.address || "Address not available"}</p>
          </div>

          {tag.url && (
            <div className="rounded-md bg-purple-100 p-5 border-2 border-purple-300">
              <h2 className="mb-3 text-xl font-bold text-purple-900">Website</h2>
              <a
                href={tag.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-800 hover:text-blue-900 hover:underline text-lg font-semibold break-all"
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
