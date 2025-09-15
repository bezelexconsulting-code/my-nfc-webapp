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
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>{tag.name || "Tag"}</h1>
      <p><strong>Contact:</strong> {tag.phone1 || "Not available"}</p>
      {tag.phone2 && <p><strong>Alt. Contact:</strong> {tag.phone2}</p>}
      <p><strong>Address:</strong> {tag.address || "Not available"}</p>
    </div>
  );
}
