// 'use client'
// import React, { useState, useEffect } from 'react';
// import { Search, Users, ChevronLeft, ChevronRight, Filter, UserPlus, Eye, Edit, Trash2, Mail, Calendar } from 'lucide-react';

// // User interface matching your API response
// interface User {
//   id: string;
//   username: string;
//   email: string;
//   createdAt: string;
//   updatedAt: string;
//   wallet: number;
//   role: string;
// }

// interface PaginatedUsersResponse {
//   data: User[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

// // API function for your actual endpoint
// const fetchUsers = async (params: {
//   page: number;
//   limit: number;
//   search?: string;
//   sortBy?: string;
//   sortOrder?: 'ASC' | 'DESC';
// }): Promise<PaginatedUsersResponse> => {
//   const searchParams = new URLSearchParams({
//     page: params.page.toString(),
//     limit: params.limit.toString(),
//     ...(params.search && { search: params.search }),
//     ...(params.sortBy && { sortBy: params.sortBy }),
//     ...(params.sortOrder && { sortOrder: params.sortOrder }),
//   });

//   const response = await fetch(`http://localhost:8800/users?${searchParams}`);
  
//   if (!response.ok) {
//     throw new Error('Failed to fetch users');
//   }
  
//   return response.json();
// };

// export default function UserManagement() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [page, setPage] = useState(1);
//   const [limit] = useState(10);
//   const [pagination, setPagination] = useState({
//     total: 0,
//     totalPages: 0
//   });

//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const response = await fetchUsers({
//         page,
//         limit,
//         search: search || undefined,
//         sortBy: 'id',
//         sortOrder: 'ASC'
//       });
//       setUsers(response.data);
//       setPagination({
//         total: response.total,
//         totalPages: response.totalPages
//       });
//     } catch (error) {
//       console.error('Failed to load users:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const debounceTimer = setTimeout(() => {
//       setPage(1); // Reset to first page when searching
//       loadUsers();
//     }, 300);

//     return () => clearTimeout(debounceTimer);
//   }, [search, page]);

//   const handleSearch = (value: string) => {
//     setSearch(value);
//   };

//   const handlePageChange = (newPage: number) => {
//     setPage(newPage);
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const getInitials = (username: string) => {
//     return username.charAt(0).toUpperCase() + (username.charAt(1) || '').toUpperCase();
//   };

//   const getRoleColor = (role: string) => {
//     switch (role.toLowerCase()) {
//       case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
//       case 'user': return 'bg-green-100 text-green-800 border-green-200';
//       case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
//       default: return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
//               <Users className="w-6 h-6 text-white" />
//             </div>
//             <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
//               User Management
//             </h1>
//           </div>
//           <p className="text-gray-600">Manage and monitor your user base with advanced filtering and pagination.</p>
//         </div>

//         {/* Controls */}
//         <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 mb-6">
//           <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
//             <div className="flex-1 max-w-md">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   type="text"
//                   placeholder="Search users by name or email..."
//                   value={search}
//                   onChange={(e) => handleSearch(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
//                 />
//               </div>
//             </div>
            
//             <div className="flex gap-3">
//               <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
//                 <Filter className="w-4 h-4" />
//                 Filters
//               </button>
//               <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
//                 <UserPlus className="w-4 h-4" />
//                 Add User
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Results Info */}
//         <div className="mb-4">
//           <p className="text-gray-600">
//             Showing {users.length} of {pagination.total} users
//             {search && <span className="font-medium"> matching "{search}"</span>}
//           </p>
//         </div>

//         {/* Users Grid */}
//         <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
//           {loading ? (
//             <div className="p-12 text-center">
//               <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//               <p className="mt-4 text-gray-600">Loading users...</p>
//             </div>
//           ) : users.length === 0 ? (
//             <div className="p-12 text-center">
//               <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-600">No users found</p>
//               {search && (
//                 <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria</p>
//               )}
//             </div>
//           ) : (
//             <>
//               {/* Desktop Table */}
//               <div className="hidden lg:block overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="bg-gray-50/50 border-b border-gray-200">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
//                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
//                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
//                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
//                       <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {users.map((user, index) => (
//                       <tr key={user.id} className="hover:bg-gray-50/50 transition-colors duration-150">
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium text-sm">
//                               {getInitials(user.username)}
//                             </div>
//                             <div>
//                               <div className="font-medium text-gray-900">{user.username}</div>
//                               <div className="text-sm text-gray-500 flex items-center gap-1">
//                                 <Mail className="w-3 h-3" />
//                                 {user.email}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getRoleColor(user.role)}`}>
//                             {user.role}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="text-sm font-medium text-gray-900">
//                             ${user.wallet.toLocaleString()}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-600">
//                           <div className="flex items-center gap-1">
//                             <Calendar className="w-3 h-3" />
//                             {formatDate(user.createdAt)}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center justify-end gap-2">
//                             <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150">
//                               <Eye className="w-4 h-4" />
//                             </button>
//                             <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-150">
//                               <Edit className="w-4 h-4" />
//                             </button>
//                             <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150">
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Mobile Cards */}
//               <div className="lg:hidden p-4 space-y-4">
//                 {users.map((user) => (
//                   <div key={user.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
//                     <div className="flex items-start justify-between mb-3">
//                       <div className="flex items-center gap-3">
//                         <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium">
//                           {getInitials(user.username)}
//                         </div>
//                         <div>
//                           <div className="font-medium text-gray-900">{user.username}</div>
//                           <div className="text-sm text-gray-500">{user.email}</div>
//                           <div className="text-sm font-medium text-green-600">${user.wallet.toLocaleString()}</div>
//                         </div>
//                       </div>
//                       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border capitalize ${getRoleColor(user.role)}`}>
//                         {user.role}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div className="text-sm text-gray-500">
//                         Joined {formatDate(user.createdAt)}
//                       </div>
//                       <div className="flex gap-2">
//                         <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg">
//                           <Eye className="w-4 h-4" />
//                         </button>
//                         <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg">
//                           <Edit className="w-4 h-4" />
//                         </button>
//                         <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg">
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Pagination */}
//               {pagination.totalPages > 1 && (
//                 <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/30">
//                   <div className="flex items-center justify-between">
//                     <div className="text-sm text-gray-600">
//                       Page {page} of {pagination.totalPages}
//                     </div>
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => handlePageChange(page - 1)}
//                         disabled={page === 1}
//                         className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
//                       >
//                         <ChevronLeft className="w-4 h-4" />
//                         Previous
//                       </button>
//                       <button
//                         onClick={() => handlePageChange(page + 1)}
//                         disabled={page === pagination.totalPages}
//                         className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
//                       >
//                         Next
//                         <ChevronRight className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import UserManagement from '@/components/dashboard/UserManagement'
import React from 'react'

const page = () => {
  return (
    <><UserManagement/></>
  )
}
export default page