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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header with Logo and Branding */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
          <div className="flex items-center justify-center mb-3">
            <img
              src="/FindIT.png"
              alt="VinditScandit Logo"
              className="h-12 w-12 mr-3"
            />
            <div className="text-white">
              <h2 className="text-lg font-bold">VinditScandit</h2>
              <p className="text-xs opacity-90">Tap To Send Me Home</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {tag.imageUrl && (
            <div className="mb-6 flex justify-center">
              <img
                src={tag.imageUrl}
                alt={tag.name || "Tag image"}
                className="max-w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
              />
            </div>
          )}
          <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">{tag.name || "NFC Tag"}</h1>

        <div className="space-y-6">
          <div className="rounded-md bg-blue-100 dark:bg-blue-900/30 p-5 border-2 border-blue-300 dark:border-blue-700">
            <h2 className="mb-3 text-xl font-bold text-blue-900 dark:text-blue-200">Contact Information</h2>
            {tag.phone1 ? (
              <p className="text-gray-900 dark:text-gray-100 text-lg mb-2 leading-relaxed">
                <strong className="text-blue-900 dark:text-blue-200">Primary:</strong>{" "}
                <a 
                  href={`tel:${tag.phone1.replace(/\s/g, '')}`}
                  className="text-blue-800 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200 hover:underline font-medium"
                >
                  {tag.phone1}
                </a>
              </p>
            ) : (
              <p className="text-gray-900 dark:text-gray-100 text-lg mb-2 leading-relaxed">
                <strong className="text-blue-900 dark:text-blue-200">Primary:</strong> Not available
              </p>
            )}
            {tag.phone2 && (
              <p className="text-gray-900 dark:text-gray-100 text-lg leading-relaxed">
                <strong className="text-blue-900 dark:text-blue-200">Secondary:</strong>{" "}
                <a 
                  href={`tel:${tag.phone2.replace(/\s/g, '')}`}
                  className="text-blue-800 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200 hover:underline font-medium"
                >
                  {tag.phone2}
                </a>
              </p>
            )}
          </div>

          {tag.address && tag.address.trim() && (
            <div className="rounded-md bg-green-100 dark:bg-green-900/30 p-5 border-2 border-green-300 dark:border-green-700">
              <h2 className="mb-3 text-xl font-bold text-green-900 dark:text-green-200">Location</h2>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tag.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-800 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200 hover:underline text-lg leading-relaxed block"
              >
                {tag.address}
              </a>
            </div>
          )}

          {tag.instructions && (
            <div className="rounded-md bg-yellow-100 dark:bg-yellow-900/30 p-5 border-2 border-yellow-300 dark:border-yellow-700">
              <h2 className="mb-3 text-xl font-bold text-yellow-900 dark:text-yellow-200">Instructions</h2>
              <p className="text-gray-900 dark:text-gray-100 text-lg leading-relaxed whitespace-pre-wrap">{tag.instructions}</p>
            </div>
          )}

          {tag.url && (
            <div className="rounded-md bg-purple-100 dark:bg-purple-900/30 p-5 border-2 border-purple-300 dark:border-purple-700">
              <h2 className="mb-3 text-xl font-bold text-purple-900 dark:text-purple-200">Website</h2>
              <a
                href={tag.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-800 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200 hover:underline text-lg font-semibold break-all"
              >
                {tag.url}
              </a>
            </div>
          )}

          {/* Order Your Own Tags Section */}
          <div className="rounded-md bg-teal-50 dark:bg-teal-900/30 p-5 border-2 border-teal-300 dark:border-teal-700 mt-6">
            <h2 className="mb-2 text-xl font-bold text-teal-900 dark:text-teal-200">Want Your Own NFC Tags?</h2>
            <p className="text-gray-700 dark:text-gray-300 text-base mb-4 leading-relaxed">
              Get your own NFC tags and start protecting what matters most. Order now and create your personalized tag profiles!
            </p>
            <a
              href="https://vinditscandit.co.za/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full text-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Order Now →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}