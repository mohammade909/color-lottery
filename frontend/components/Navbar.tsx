'use client'
import { useAuthStore } from '@/store/authStore';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  console.log(user)
  return (
    <nav className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold">Color Game</span>
        </div>
        
        {isAuthenticated && (
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-white">Balance:</span>
              <span className="text-sm font-bold bg-purple-800 px-2 py-1 rounded">
                ${user?.wallet || '0.00'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                Welcome, <span className="font-semibold">{user?.username}</span>
              </span>
            </div>
            
            <button 
              onClick={logout}
              className="text-sm bg-white text-purple-800 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;