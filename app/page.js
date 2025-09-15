import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to NFC Tag Manager</h1>
      <div className="space-x-4">
        <Link href="/client/dashboard" className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Go to Client Dashboard
        </Link>
        <Link href="/admin/login" className="px-6 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700">
          Go to Admin Login
        </Link>
      </div>
    </div>
  );
}