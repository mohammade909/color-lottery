'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { disconnectSocket } from '@/lib/socket';

interface User {
  id: string;
  username: string;
}

const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        setUser(userData);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('auth-storage');
    
    // Disconnect socket
    disconnectSocket();
    
    // Reset user state
    setUser(null);
    
    // Redirect to login page
    router.push('/');
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Color Game
          </Link>
          
          <div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">Welcome, {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium py-1 px-3 rounded"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link href="/login" className="bg-white text-blue-600 hover:bg-blue-50 text-sm font-medium py-1 px-3 rounded">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium py-1 px-3 rounded">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;