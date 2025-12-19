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
}

export default function StatCard({ title, value, icon, change, subtitle }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-between">
        {icon && (
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            {icon}
          </div>
        )}
        {change && (
          <Badge color={change.trend === "up" ? "success" : "error"}>
            {change.trend === "up" ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {change.value}
          </Badge>
        )}
      </div>
      <div className="mt-5">
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
          {value}
        </h4>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
