"use client";

import { useState, useEffect } from "react";

export default function PublicTagPage({ params }) {
  const slug = params?.slug; // safely access slug
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function loadTag() {
      try {
        const res = await fetch(`/api/tags/${slug}`);
        if (!res.ok) {
          setTag(null);
        } else {
          const data = await res.json();
          setTag(data);
        }
      } catch (error) {
        console.error(error);
        setTag(null);
      }
      setLoading(false);
    }

    loadTag();
  }, [slug]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!tag) return <p className="p-4 text-red-500">Tag not found.</p>;

  // Public read-only display
  return (
    <div className="p-4 max-w-md mx-auto border rounded shadow-sm">
      <h1 className="text-xl font-bold mb-4">Tag Info</h1>
      <p><strong>Name:</strong> {tag.name || "N/A"}</p>
      <p><strong>Phone 1:</strong> {tag.phone1 || "N/A"}</p>
      <p><strong>Phone 2:</strong> {tag.phone2 || "N/A"}</p>
      <p><strong>Address:</strong> {tag.address || "N/A"}</p>
    </div>
  );
}