// src/components/ui/Sidebar.tsx
'use client'
import React, { useState, useEffect } from "react";
import {
  Home,
  BarChart3,
  Users,
  Settings,
  Activity,
  DollarSign,
  TrendingUp,
  Bell,
  Shield,
  LogOut,
  ChevronDown,
  ChevronRight,
  GamepadIcon,
  CreditCard,
  Wallet,
  PieChart,
  FileText,
  AlertCircle,
  Lock,
  User,
  Cog,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { disconnectSocket } from "@/lib/socket";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  children?: MenuItem[];
}

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: Home, 
      href: "/manager" 
    },
    {
      id: "games",
      label: "Games",
      icon: Activity,
      href: "/games",
      children: [
        { id: "games-list", label: "All Games", icon: GamepadIcon, href: "/games" },
        { id: "games-add", label: "Add Game", icon: Activity, href: "/games/add" },
        { id: "games-categories", label: "Categories", icon: PieChart, href: "/games/categories" },
      ],
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
      href: "/manager",
      children: [
        { id: "users-list", label: "All Users", icon: Users, href: "/manager/users" },
        { id: "users-roles", label: "User Roles", icon: Shield, href: "/users/roles" },
        { id: "users-permissions", label: "Permissions", icon: Lock, href: "/users/permissions" },
      ],
    },
    {
      id: "finance",
      label: "Finance",
      icon: DollarSign,
      href: "/manager",
      children: [
        { id: "transactions", label: "Transactions", icon: CreditCard, href: "/manager/transactions" },
        { id: "payments", label: "Payments", icon: Wallet, href: "/finance/payments" },
        { id: "reports", label: "Financial Reports", icon: FileText, href: "/finance/reports" },
      ],
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      href: "/analytics",
      children: [
        { id: "overview", label: "Overview", icon: BarChart3, href: "/analytics" },
        { id: "user-analytics", label: "User Analytics", icon: Users, href: "/analytics/users" },
        { id: "game-analytics", label: "Game Analytics", icon: GamepadIcon, href: "/analytics/games" },
      ],
    },
    {
      id: "reports",
      label: "Reports",
      icon: TrendingUp,
      href: "/reports",
      children: [
        { id: "daily-reports", label: "Daily Reports", icon: FileText, href: "/reports/daily" },
        { id: "monthly-reports", label: "Monthly Reports", icon: TrendingUp, href: "/reports/monthly" },
        { id: "custom-reports", label: "Custom Reports", icon: PieChart, href: "/reports/custom" },
      ],
    },
    { 
      id: "notifications", 
      label: "Notifications", 
      icon: Bell, 
      href: "/notifications" 
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      href: "/security",
      children: [
        { id: "audit-logs", label: "Audit Logs", icon: FileText, href: "/security/audit" },
        { id: "security-alerts", label: "Security Alerts", icon: AlertCircle, href: "/security/alerts" },
        { id: "access-control", label: "Access Control", icon: Lock, href: "/security/access" },
      ],
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/settings",
      children: [
        { id: "general-settings", label: "General", icon: Cog, href: "/settings/general" },
        { id: "profile-settings", label: "Profile", icon: User, href: "/settings/profile" },
        { id: "system-settings", label: "System", icon: Settings, href: "/settings/system" },
      ],
    },
  ];

  // Initialize expanded items based on current path
  useEffect(() => {
    const findParentItem = (items: MenuItem[], currentPath: string): string | null => {
      for (const item of items) {
        if (item.children) {
          const childMatch = item.children.find(child => child.href === currentPath);
          if (childMatch) return item.id;
          
          const nestedMatch = findParentItem(item.children, currentPath);
          if (nestedMatch) return item.id;
        }
      }
      return null;
    };

    const parentId = findParentItem(menuItems, pathname);
    if (parentId && !expandedItems.includes(parentId)) {
      setExpandedItems(prev => [...prev, parentId]);
    }
  }, [pathname]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    }
    // Always call onTabChange if provided
    if (onTabChange) {
      onTabChange(item.id);
    }
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (activeTab) {
      return activeTab === item.id;
    }
    // Check if current path matches item href or any of its children
    if (item.href === pathname) return true;
    if (item.children) {
      return item.children.some(child => child.href === pathname);
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const Icon = item.icon;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;

    const buttonContent = (
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon className={`h-5 w-5 ${level > 0 ? 'h-4 w-4' : ''}`} />
          <span className={level > 0 ? 'text-sm' : ''}>{item.label}</span>
        </div>
        {hasChildren && (
          isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )
        )}
      </div>
    );

    const buttonClasses = `w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
      level > 0 ? 'ml-4 px-3 py-2' : ''
    } ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

    return (
      <div key={item.id}>
        {hasChildren ? (
          <button
            onClick={() => handleItemClick(item)}
            className={buttonClasses}
          >
            {buttonContent}
          </button>
        ) : (
          <Link href={item.href} className="block">
            <button
              onClick={() => handleItemClick(item)}
              className={buttonClasses}
            >
              {buttonContent}
            </button>
          </Link>
        )}
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleLogout = () => {
   // Clear local storage
       localStorage.clear()
      //  localStorage.removeItem('token');
      //  localStorage.removeItem('auth-storage');
       
       // Disconnect socket
       disconnectSocket();
       
       // Reset user state
       
       // Redirect to login page
       router.push('/');
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleAccountSettings = () => {
    router.push('/settings/account');
  };

  return (
    <div className="h-full bg-gray-900 text-white w-64 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <p className="text-sm text-gray-400">Gaming Platform</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-800 p-4">
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">AD</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-400">admin@example.com</p>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Dropdown */}
          {userDropdownOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2">
              <button 
                onClick={handleProfileClick}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-700 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="text-sm">Profile</span>
              </button>
              <button 
                onClick={handleAccountSettings}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-700 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm">Account Settings</span>
              </button>
              <hr className="border-gray-700 my-2" />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-700 transition-colors text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;