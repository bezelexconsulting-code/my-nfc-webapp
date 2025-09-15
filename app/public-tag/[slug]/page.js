"use client";
import React, { useState, useEffect } from "react";

export default function PublicTagPage({ params }) {
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const p = await params;
        const slug = p?.slug;
        if (!slug) {
          if (mounted) setLoading(false);
          return;
        }

        const res = await fetch(`/api/${slug}`);
        if (!res.ok) {
          if (mounted) {
            setTag(null);
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
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [params]);

  if (loading) return <p>Loading...</p>;
  if (!tag) return <p>Tag not found</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Public Tag: {tag.slug || ""}</h1>
      <p><strong>Name:</strong> {tag.name || "Not set"}</p>
      <p><strong>Phone 1:</strong> {tag.phone1 || "Not set"}</p>
      <p><strong>Phone 2:</strong> {tag.phone2 || "Not set"}</p>
      <p><strong>Address:</strong> {tag.address || "Not set"}</p>
    </div>
  );
}
