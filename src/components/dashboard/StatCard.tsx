import React, { ReactNode } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: {
    value: string;
    trend: "up" | "down";
  };
  subtitle?: string;
  onClick?: () => void;
  isActive?: boolean;
  color?: "default" | "blue" | "green" | "red" | "orange";
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  change, 
  subtitle, 
  onClick, 
  isActive = false,
  color = "default"
}: StatCardProps) {
  
  const colorStyles = {
    default: "hover:border-gray-300 dark:hover:border-gray-600",
    blue: "hover:border-blue-200 dark:hover:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10",
    green: "hover:border-green-200 dark:hover:border-green-800 bg-green-50/50 dark:bg-green-900/10",
    red: "hover:border-red-200 dark:hover:border-red-800 bg-red-50/50 dark:bg-red-900/10",
    orange: "hover:border-orange-200 dark:hover:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10",
  }[color];

  const activeStyle = isActive 
    ? "ring-2 ring-brand-500 border-brand-500 shadow-xl scale-[1.02]" 
    : "border-white/20 hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-500/10";

  const Comp = onClick ? 'button' : 'div';

  return (
    <Comp 
      onClick={onClick}
      className={`group relative text-left w-full overflow-hidden rounded-3xl border bg-white/70 p-5 shadow-xl shadow-gray-100/50 backdrop-blur-xl transition-all duration-300 ease-out dark:border-gray-800 dark:bg-gray-900/60 dark:shadow-none ${activeStyle} ${isActive ? '' : colorStyles}`}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-brand-500/5 to-purple-500/5 blur-2xl dark:from-brand-400/10 dark:to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h4 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {value}
          </h4>
          {subtitle && <p className="mt-1 text-xs font-medium text-gray-400">{subtitle}</p>}
        </div>

        {icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner transition-colors ${isActive ? 'bg-brand-500 text-white' : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 dark:from-gray-800 dark:to-gray-900 dark:text-gray-300 group-hover:bg-white dark:group-hover:bg-gray-800'}`}>
            {icon}
          </div>
        )}
      </div>

      {change && (
        <div className="mt-4 flex items-center gap-2">
          <Badge color={change.trend === "up" ? "success" : "error"} className="px-2 py-0.5 text-xs font-bold">
            {change.trend === "up" ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
            {change.value}
          </Badge>
          <span className="text-xs text-gray-400">vs last month</span>
        </div>
      )}
    </Comp>
  );
}
