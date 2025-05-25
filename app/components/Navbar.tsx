"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppProvider";
import { useState, useCallback } from "react";
import { 
  HomeIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BookOpenIcon,
  BellIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { logout, authToken, user, isLoading } = useAppContext();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      router.push('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, router]);

  const handleDashboardClick = useCallback((e: React.MouseEvent) => {
    if (!authToken) {
      e.preventDefault();
      router.push('/auth');
    }
  }, [authToken, router]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  if (isLoading) {
    return (
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center">
              <BookOpenIcon className="h-6 w-6 text-primary-600" />
              <span className="ml-2 text-base font-medium">Digital Library</span>
            </div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center text-gray-900 hover:text-primary-600"
            >
              <BookOpenIcon className="h-6 w-6" />
              <span className="ml-2 text-base font-medium">Digital Library</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {authToken ? (
              <>
                <Link 
                  href="/" 
                  className="px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                >
                  <HomeIcon className="h-5 w-5" />
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    href="/dashboard" 
                    className="px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                    onClick={handleDashboardClick}
                  >
                    <BookOpenIcon className="h-5 w-5" />
                  </Link>
                )}
                <Link 
                  href="/notifications" 
                  className="px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md relative"
                >
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </Link>
                <Link 
                  href="/messages" 
                  className="px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="ml-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link 
                href="/auth" 
                className="px-3 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md"
              >
                <UserCircleIcon className="h-5 w-5" />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="p-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {authToken ? (
                <>
                  <Link 
                    href="/" 
                    className="flex items-center px-3 py-2 text-base text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HomeIcon className="h-5 w-5 mr-2" />
                    Home
                  </Link>
                  {user?.role === 'admin' && (
                    <Link 
                      href="/dashboard" 
                      className="flex items-center px-3 py-2 text-base text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BookOpenIcon className="h-5 w-5 mr-2" />
                      Dashboard
                    </Link>
                  )}
                  <Link 
                    href="/notifications" 
                    className="flex items-center px-3 py-2 text-base text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BellIcon className="h-5 w-5 mr-2" />
                    <span className="relative">
                      Notifications
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                    </span>
                  </Link>
                  <Link 
                    href="/messages" 
                    className="flex items-center px-3 py-2 text-base text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    Messages
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-base text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  href="/auth" 
                  className="flex items-center px-3 py-2 text-base text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserCircleIcon className="h-5 w-5 mr-2" />
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 