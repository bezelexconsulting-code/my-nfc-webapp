import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-8">
          <Image
            src="/FindIT.png"
            alt="VinditScandit Logo"
            width={128}
            height={128}
            className="h-32 w-32 mx-auto mb-4"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-800">
          Welcome to VinditScandit Tag Manager
        </h1>
        <p className="text-gray-600 mb-8 text-sm sm:text-base">
          Manage your NFC tags with ease. Access your dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4 sm:space-y-0">
          <Link
            href="/demo"
            className="w-full sm:w-auto px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg hover:from-blue-700 hover:to-teal-700 transition-colors duration-200 text-center font-medium touch-manipulation shadow-lg"
          >
            🎬 View Demo
          </Link>
          <Link
            href="/client/dashboard"
            className="w-full sm:w-auto px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center font-medium touch-manipulation"
          >
            Client Dashboard
          </Link>
          <Link
            href="/admin/login"
            className="w-full sm:w-auto px-6 py-3 text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-center font-medium touch-manipulation"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}

