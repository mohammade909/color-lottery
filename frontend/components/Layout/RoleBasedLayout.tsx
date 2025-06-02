"use client";
import React, { ReactNode, useEffect } from "react";
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

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!loading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      router.replace("/");
    }
  }, [isAuthenticated, loading, router]);

  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect is happening)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Admin Layout
  if (user.role === "admin") {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  // User Layout (assuming regular users get Layout component)
  if (user.role === "user") {
    return <Layout>{children}</Layout>;
  }

  // Unknown role - redirect to login or show error
  console.error("Unknown user role:", user.role);
  router.replace("/");
  return null;
};

export default RoleBasedLayout;
