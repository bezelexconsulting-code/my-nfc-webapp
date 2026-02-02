import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import ThemeToggle from "../components/ThemeToggle";
import OfflineIndicator from "../components/OfflineIndicator";
import ServiceWorkerRegistration from "../components/ServiceWorkerRegistration";
import SessionProvider from "../components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NFC Tag Manager",
  description: "Manage your NFC tags with ease",
  icons: {
    icon: "/FindIT.png",
    apple: "/FindIT.png",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerRegistration />
        <SessionProvider>
        <ThemeProvider>
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Image
                    src="/FindIT.png"
                    alt="VinditScandit Logo"
                    width={48}
                    height={48}
                    className="h-12 w-12 mr-3"
                  />
                  <div className="flex flex-col">
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">NFC Tag Manager</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">VinditScandit</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </header>
          <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
          <OfflineIndicator />
        </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}