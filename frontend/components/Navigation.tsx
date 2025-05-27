'use client'
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };
 
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Real-Time App
        </Link>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span>Welcome, {user?.wallet}</span>
              <Link href="/dashboard" className="hover:text-blue-200">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-800"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/" className="hover:text-blue-200">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
