// utils/formatters.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("id-ID");
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return isFinite(value) ? `${value.toFixed(decimals)}%` : "-";
};

export const getStatusColor = (status: string): string => {
  const s = status.toLowerCase();
  if (s.includes("paid") && !s.includes("unpaid"))
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (s.includes("progress") || s.includes("in_progress"))
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  if (s.includes("cancel"))
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
};

export const getProgressColor = (percent: number): string => {
  if (percent >= 80) return "bg-green-600";
  if (percent >= 50) return "bg-yellow-500";
  return "bg-red-500";
};