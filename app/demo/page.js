"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTag, setSelectedTag] = useState(null);

  // Sample demo data
  const sampleTags = [
    {
      id: 1,
      slug: "demo-business-card",
      name: "John's Business Card",
      phone1: "+27 82 123 4567",
      phone2: "+27 11 234 5678",
      address: "123 Main Street, Johannesburg, South Africa",
      url: "https://example.com",
      instructions: "Call for appointments. Office hours: Mon-Fri 9am-5pm",
      imageUrl: null,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20"
    },
    {
      id: 2,
      slug: "demo-restaurant-menu",
      name: "Café Delight Menu",
      phone1: "+27 21 345 6789",
      phone2: "",
      address: "456 Restaurant Row, Cape Town, South Africa",
      url: "https://cafedelight.co.za",
      instructions: "Open daily 7am-10pm. Reservations recommended on weekends.",
      imageUrl: null,
      createdAt: "2024-01-10",
      updatedAt: "2024-01-18"
    },
    {
      id: 3,
      slug: "demo-product-info",
      name: "Premium Product NFC Tag",
      phone1: "+27 31 456 7890",
      phone2: "",
      address: "789 Industrial Park, Durban, South Africa",
      url: "https://product-demo.com",
      instructions: "Scan for product specifications, warranty info, and support.",
      imageUrl: null,
      createdAt: "2024-01-05",
      updatedAt: "2024-01-15"
    }
  ];

  const demoStats = {
    totalTags: sampleTags.length,
    totalScans: 1247,
    activeClients: 15,
    popularTag: sampleTags[0]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/FindIT.png"
                alt="TagWave Logo"
                width={48}
                height={48}
                className="h-12 w-12 mr-3"
              />
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">TagWave</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">NFC Tag Management Demo</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-semibold">
                DEMO MODE
              </span>
              <Link
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Back to App
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">NFC Tag Management Platform</h2>
          <p className="text-xl mb-8 opacity-90">
            Create, manage, and track your NFC tags with ease
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/20 backdrop-blur rounded-lg px-6 py-4">
              <div className="text-3xl font-bold">{demoStats.totalTags}</div>
              <div className="text-sm opacity-90">Tags Created</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg px-6 py-4">
              <div className="text-3xl font-bold">{demoStats.totalScans.toLocaleString()}</div>
              <div className="text-sm opacity-90">Total Scans</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg px-6 py-4">
              <div className="text-3xl font-bold">{demoStats.activeClients}</div>
              <div className="text-sm opacity-90">Active Clients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Overview" },
              { id: "dashboard", label: "Client Dashboard" },
              { id: "public-tag", label: "Public Tag Page" },
              { id: "features", label: "Key Features" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Platform Overview</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                TagWave is a comprehensive NFC tag management platform that allows businesses and individuals 
                to create, manage, and track NFC tags. Perfect for business cards, product information, 
                restaurant menus, and more.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-3xl mb-2">📱</div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Easy Management</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Simple dashboard to create and edit your NFC tags
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-3xl mb-2">🌐</div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Public Pages</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Beautiful public pages for each tag that anyone can access
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-3xl mb-2">📊</div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Analytics</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Track scans and monitor tag performance
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Use Cases</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-200">Business Cards</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Replace paper business cards with NFC-enabled cards that instantly share contact information
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-900 dark:text-green-200">Restaurant Menus</h4>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Provide digital menus that can be updated in real-time without reprinting
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2 text-purple-900 dark:text-purple-200">Product Information</h4>
                  <p className="text-sm text-purple-800 dark:text-purple-300">
                    Link products to detailed specifications, warranty info, and support resources
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-200">Event Information</h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    Share event details, schedules, and updates through NFC tags
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, Demo User</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Total Tags: <span className="font-semibold">{sampleTags.length}</span>
                  </p>
                </div>
                <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                  Settings
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search tags..."
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3"
                />
                <select className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3">
                  <option>Sort by Name</option>
                  <option>Newest First</option>
                  <option>Recently Updated</option>
                </select>
              </div>
            </div>

            {/* Tags List */}
            <div className="space-y-4">
              {sampleTags.map(tag => (
                <div
                  key={tag.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{tag.slug}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{tag.name}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                      ID: {tag.id}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={tag.name}
                        readOnly
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone 1
                      </label>
                      <input
                        type="tel"
                        value={tag.phone1}
                        readOnly
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Address
                      </label>
                      <textarea
                        value={tag.address}
                        readOnly
                        rows="2"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setSelectedTag(tag);
                        setActiveTab("public-tag");
                      }}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Public Page →
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Save Changes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "public-tag" && (
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
                  <div className="flex items-center justify-center mb-3">
                    <Image
                      src="/FindIT.png"
                      alt="TagWave Logo"
                      width={48}
                      height={48}
                      className="h-12 w-12 mr-3"
                    />
                    <div className="text-white">
                      <h2 className="text-lg font-bold">TagWave</h2>
                      <p className="text-xs opacity-90">Tap To Connect</p>
                    </div>
                  </div>
                </div>

                {/* Tag Content */}
                <div className="p-6">
                  {selectedTag ? (
                    <>
                      <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
                        {selectedTag.name}
                      </h1>

                      <div className="space-y-6">
                        <div className="rounded-md bg-blue-100 dark:bg-blue-900/30 p-5 border-2 border-blue-300 dark:border-blue-700">
                          <h2 className="mb-3 text-xl font-bold text-blue-900 dark:text-blue-200">
                            Contact Information
                          </h2>
                          <p className="text-gray-900 dark:text-gray-100 text-lg mb-2">
                            <strong className="text-blue-900 dark:text-blue-200">Primary:</strong>{" "}
                            <a href={`tel:${selectedTag.phone1.replace(/\s/g, '')}`} className="text-blue-800 dark:text-blue-300 hover:underline">
                              {selectedTag.phone1}
                            </a>
                          </p>
                          {selectedTag.phone2 && (
                            <p className="text-gray-900 dark:text-gray-100 text-lg">
                              <strong className="text-blue-900 dark:text-blue-200">Secondary:</strong>{" "}
                              <a href={`tel:${selectedTag.phone2.replace(/\s/g, '')}`} className="text-blue-800 dark:text-blue-300 hover:underline">
                                {selectedTag.phone2}
                              </a>
                            </p>
                          )}
                        </div>

                        {selectedTag.address && (
                          <div className="rounded-md bg-green-100 dark:bg-green-900/30 p-5 border-2 border-green-300 dark:border-green-700">
                            <h2 className="mb-3 text-xl font-bold text-green-900 dark:text-green-200">Location</h2>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedTag.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-800 dark:text-blue-300 hover:underline text-lg block"
                            >
                              {selectedTag.address}
                            </a>
                          </div>
                        )}

                        {selectedTag.instructions && (
                          <div className="rounded-md bg-yellow-100 dark:bg-yellow-900/30 p-5 border-2 border-yellow-300 dark:border-yellow-700">
                            <h2 className="mb-3 text-xl font-bold text-yellow-900 dark:text-yellow-200">Instructions</h2>
                            <p className="text-gray-900 dark:text-gray-100 text-lg whitespace-pre-wrap">
                              {selectedTag.instructions}
                            </p>
                          </div>
                        )}

                        {selectedTag.url && (
                          <div className="rounded-md bg-purple-100 dark:bg-purple-900/30 p-5 border-2 border-purple-300 dark:border-purple-700">
                            <h2 className="mb-3 text-xl font-bold text-purple-900 dark:text-purple-200">Website</h2>
                            <a
                              href={selectedTag.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-800 dark:text-blue-300 hover:underline text-lg font-semibold break-all"
                            >
                              {selectedTag.url}
                            </a>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Select a tag from the Dashboard tab to view its public page
                      </p>
                      <button
                        onClick={() => setActiveTab("dashboard")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "features" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">✨ Key Features</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Create unlimited NFC tags</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Customize tag information (name, phone, address, etc.)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Upload images for each tag</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Search and filter tags</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Bulk operations (delete multiple tags)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Beautiful public pages for each tag</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Mobile-responsive design</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Dark mode support</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">🔒 Security & Management</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Secure client authentication</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Admin panel for tag management</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Email verification system</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Password reset functionality</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>User profile management</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Export tag data</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">🚀 Getting Started</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>Register for a new account</li>
                <li>Create your first NFC tag</li>
                <li>Program your physical NFC tag with the public URL</li>
                <li>Share your tag and track scans</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            This is a demo version of TagWave - NFC Tag Management Platform
          </p>
          <p className="text-sm text-gray-500 mt-2">
            For the full experience, please register and create an account
          </p>
        </div>
      </footer>
    </div>
  );
}
