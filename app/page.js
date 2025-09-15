'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">NFC Tag Management System</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">Client Dashboard</h2>
            <p className="text-gray-600 mb-6">Access your NFC tags and update their information.</p>
            <Link 
              href="/client/dashboard" 
              className="block w-full py-2 px-4 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
            >
              Login to Dashboard
            </Link>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4 text-green-700">Register</h2>
            <p className="text-gray-600 mb-6">Create a new client account to manage your NFC tags.</p>
            <Link 
              href="/register" 
              className="block w-full py-2 px-4 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition-colors"
            >
              Register Now
            </Link>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4 text-purple-700">Admin Access</h2>
            <p className="text-gray-600 mb-6">Administrators can manage all tags and clients.</p>
            <Link 
              href="/admin/login" 
              className="block w-full py-2 px-4 bg-purple-600 text-white text-center rounded-md hover:bg-purple-700 transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>
        
        <div className="text-center text-gray-500">
          <p>Scan an NFC tag to view its information or use the client dashboard to manage your tags.</p>
        </div>
      </div>
    </div>
  );
}