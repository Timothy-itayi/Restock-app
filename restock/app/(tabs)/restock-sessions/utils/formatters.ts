// Utility functions for formatting data

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatProductCount = (count: number): string => {
  return `${count} product${count !== 1 ? 's' : ''}`;
};

export const formatSupplierCount = (count: number): string => {
  return `${count} supplier${count !== 1 ? 's' : ''}`;
};