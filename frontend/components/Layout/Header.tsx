"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore"; // Adjust the import path as needed

const Header: React.FC = () => {
  const { user, isAuthenticated, logout, getProfile } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    // If there's a token but no user, try to get the user profile
    if (isAuthenticated && !user) {
      // You might want to get the user ID from the token or localStorage
      const userJson = localStorage.getItem("user");
      if (userJson) {
        try {
          const userData = JSON.parse(userJson);
          if (userData.id) {
            getProfile(userData.id);
          }
        } catch (e) {
          console.error("Failed to parse user data:", e);
        }
      }
    }
  }, [isAuthenticated, user, getProfile]);

  const handleLogout = () => {
    // Clear any additional localStorage items if needed
    localStorage.removeItem("user");
    localStorage.removeItem("auth-storage");
    
    // Use the store's logout function
    logout();

    // Redirect to login page
    router.push("/");
  };

  return (
    <>
      <header className="fixed w-full z-50 bg-[#2d2a2a] text-white shadow-2xl border-b border-purple-500/20">
        <div className="absolute inset-0 opacity-50"></div>

        <div className="relative container mx-auto px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            {/* Left: Back Arrow */}
            <div className="flex justify-start">
         
            </div>

            {/* Center: Logo */}
            <div className="w-full flex justify-center">
              <Link href="/" className="group">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-[#484848ab] flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right: Auth/User Section */}
            <div className="flex justify-end">
              {user ? (
                <div className="flex items-center gap-3 justify-end">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium hidden sm:inline-block">
                      Welcome, {user.username}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="group px-4 py-2 rounded-full text-white text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    <span className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Logout</span>
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 justify-end">
                  <Link
                    href="/login"
                    className="group px-2 py-2 rounded-full text-sm hover:bg-white/10 transition-colors"
                  >
                    <span className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Login</span>
                    </span>
                  </Link>
                  <Link
                    href="/register"
                    className="group px-4 py-2 rounded-full bg-[#5e4408a1] text-white text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                  >
                    <span className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                      <span>Register</span>
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="h-[55px]"></div>
    </>
  );
};

export default Header;