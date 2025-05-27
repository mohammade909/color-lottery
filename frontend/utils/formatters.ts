// src/utils/formatters.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatTimeRemaining = (endTime: string): string => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return 'Ended';
  
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

export const getColorClass = (color: string): string => {
  switch (color.toLowerCase()) {
    case 'red': return 'text-red-500 bg-red-100';
    case 'green': return 'text-green-500 bg-green-100';
    case 'black': return 'text-gray-800 bg-gray-100';
    default: return 'text-gray-500 bg-gray-100';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active': return 'text-green-500';
    case 'error': return 'text-red-500';
    default: return 'text-yellow-500';
  }
};