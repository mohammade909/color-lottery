"use client";
import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import RoleBasedLayout from "./RoleBasedLayout";

interface ClientLayoutWrapperProps {
  children: ReactNode;
}

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/', '/about'];

const PrivateRoutes: React.FC<ClientLayoutWrapperProps> = ({ children }) => {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // For public routes, render without RoleBasedLayout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, wrap with RoleBasedLayout
  return <RoleBasedLayout>{children}</RoleBasedLayout>;
};

export default PrivateRoutes;
