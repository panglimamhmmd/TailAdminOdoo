import React from "react";
import { PIC_MAP, ProjectName, ProjectPIC } from "./PIC";

const ROLE_COLOR_MAP: Record<string, string> = {
  ARCH: "bg-blue-500",
  INTR: "bg-purple-500",
  DRFT: "bg-green-500",
  PM: "bg-pink-500",
  PGWS: "bg-yellow-500",
};

export default function PICList({ projectName }: { projectName: string }) {
  if (!PIC_MAP || typeof PIC_MAP !== "object") {
    console.error("❌ PIC_MAP is undefined or not an object");
    return (
      <div className="text-center text-red-400 text-[10px] py-2">
        PIC data unavailable
      </div>
    );
  }

  const normalizedName = projectName?.replace(/\(copy\)/gi, "").trim().toUpperCase() || "";

  const matchedKey = (Object.keys(PIC_MAP) as ProjectName[]).find((key) => {
    const normalizedKey = key.trim().toUpperCase();
    return (
      normalizedKey === normalizedName ||
      normalizedName.includes(normalizedKey) ||
      normalizedKey.includes(normalizedName)
    );
  });

  const projectPICs: ProjectPIC | undefined = matchedKey ? PIC_MAP[matchedKey] : undefined;

  if (!projectPICs) {
    return (
      <div className="text-center text-gray-700 dark:text-gray-300 text-[10px] py-2">
        No PIC available
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {Object.entries(projectPICs).map(([role, name]) => {
        const colorClass = ROLE_COLOR_MAP[role] || "bg-gray-400";

        return (
          <div
            key={role}
            className="bg-white py-2 px-1.5 dark:bg-gray-900/80 rounded shadow-sm border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between gap-1.5"
          >
            <div className="flex items-center gap-1 min-w-0">
              <div className={`w-1.5 h-1.5 rounded-full ${colorClass} flex-shrink-0`}></div>
              <div className="text-[9px] text-gray-500 dark:text-gray-400 font-medium uppercase">
                {role}
              </div>
            </div>
            
            <div
              className="font-semibold text-gray-800 dark:text-white text-[10px] uppercase truncate max-w-[80px] text-right"
              title={name && name !== "-" ? name : "Not assigned"}
            >
              {name && name !== "-" ? name : "-"}
            </div>
          </div>
        );
      })}
    </div>
  );
}