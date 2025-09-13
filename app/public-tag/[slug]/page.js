"use client";
import { useState, useEffect } from "react";

export default function PublicTagPage({ params }) {
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/${params.slug}`)
      .then((res) => res.json())
      .then((data) => {
        setTag(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <p>Loading...</p>;
  if (!tag) return <p>Tag not found</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Public Tag: {params.slug}</h1>
      <p><strong>Name:</strong> {tag.name || "Not set"}</p>
      <p><strong>Phone 1:</strong> {tag.phone1 || "Not set"}</p>
      <p><strong>Phone 2:</strong> {tag.phone2 || "Not set"}</p>
      <p><strong>Address:</strong> {tag.address || "Not set"}</p>
    </div>
  );
}
