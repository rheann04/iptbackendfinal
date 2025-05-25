"use client";

import Link from "next/link";
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Welcome to Library System
          </h1>
          <p className="text-lg md:text-xl mb-8 text-primary-100">
            A modern solution for managing your library
          </p>
          <Link 
            href="/auth" 
            className="inline-flex items-center px-6 py-3 bg-white text-primary-600 rounded-md hover:bg-gray-50 transition-colors"
          >
            Get Started
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} Library Management System</p>
        </div>
      </footer>
    </div>
  );
} 