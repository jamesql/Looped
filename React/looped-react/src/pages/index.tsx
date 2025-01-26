import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      {/* Header Section */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-semibold text-blue-600">Welcome to Looped!</h1>
        <p className="text-lg text-gray-600 mt-4">
          Create an account or login to get started. The best platform to connect and share.
        </p>
      </header>

      {/* Buttons */}
      <div className="flex space-x-4">
        {/* Login Button */}
        <Link legacyBehavior href="/login">
          <a>
            <button
              className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition-all"
            >
              Login
            </button>
          </a>
        </Link>

        {/* Sign Up Button */}
        <Link legacyBehavior href="/signup">
          <a>
            <button
              className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 transition-all"
            >
              Sign Up
            </button>
          </a>
        </Link>
      </div>
    </div>
  );
}
