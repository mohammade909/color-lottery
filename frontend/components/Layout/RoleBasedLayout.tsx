"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import DashboardLayout from "./DashboardLayout";
import Layout from "./Layout";

interface RoleBasedLayoutProps {
  children: ReactNode;
}

const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Only redirect after loading is complete and we're sure user is not authenticated
    if (!loading) {
      if (!isAuthenticated || !user) {
        console.log("User not authenticated, redirecting to login");
        setShouldRedirect(true);
        // Small delay to prevent flashing
        const timer = setTimeout(() => {
          router.replace("/");
        }, 100);
        
        return () => clearTimeout(timer);
      } else {
        setShouldRedirect(false);
      }
    }
  }, [isAuthenticated, user, loading, router]);

  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Authenticating...</span>
        </div>
      </div>
    );
  }

  // If redirecting, show a brief loading state
  if (shouldRedirect || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Redirecting...</span>
        </div>
      </div>
    );
  }

  // Render based on user role
  switch (user.role) {
    case "admin":
      return <DashboardLayout>{children}</DashboardLayout>;
    
    case "user":
      return <Layout>{children}</Layout>;
    
    default:
      console.error("Unknown user role:", user.role);
      // For unknown roles, redirect to login
      useEffect(() => {
        router.replace("/");
      }, []);
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">Invalid user role</p>
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      );
  }
};

export default RoleBasedLayout;