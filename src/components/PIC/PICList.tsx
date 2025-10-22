import React from "react";
import { PIC_MAP, ProjectName, ProjectPIC } from "./PIC";

const ROLE_COLOR_MAP: Record<string, string> = {
  ARCH: "bg-blue-500",
  INTR: "bg-purple-500",
  DRFT: "bg-green-500",
  PM: "bg-pink-500",
  PGWS: "bg-yellow-500",
};

export default function       PICList({ projectName }: { projectName: string }) {
  if (!PIC_MAP || typeof PIC_MAP !== "object") {
    console.error("❌ PIC_MAP is undefined or not an object");
    return (
      <div className="text-center text-red-400 text-xs md:text-sm">
        PIC data unavailable
      </div>
    );
  }

  // Normalisasi nama project: hilangin copy, trim, upper-case
  const normalizedName =
    projectName?.replace(/\(copy\)/gi, "").trim().toUpperCase() || "";

  // Log buat debug (hapus kalau udah stabil)

  // Cari key yang paling cocok (case-insensitive & tolerant)
  const matchedKey = (Object.keys(PIC_MAP) as ProjectName[]).find((key) => {
    const normalizedKey = key.trim().toUpperCase();
    return (
      normalizedKey === normalizedName ||
      normalizedName.includes(normalizedKey) ||
      normalizedKey.includes(normalizedName)
    );
  });

  // console.log("✅ Matched key:", matchedKey)

  const projectPICs: ProjectPIC | undefined = matchedKey
    ? PIC_MAP[matchedKey]
    : undefined;

  if (!projectPICs) {
    return (
      <div className="text-center text-white text-xs md:text-sm">
        No PIC available for <span className="font-semibold">{projectName}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-3">
      {Object.entries(projectPICs).map(([role, name]) => {
        const colorClass = ROLE_COLOR_MAP[role] || "bg-gray-400";

        return (
          <div
            key={role}
            className="bg-white py-2 px-1 dark:bg-gray-900 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-900 flex items-center justify-around"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">
                {role}
              </div>
            </div>
          <div
            className="font-semibold text-gray-800 dark:text-white text-xs md:text-sm pl-4 uppercase truncate max-w-[120px]"
          >
            {name && name !== "-" ? name : "-"}
          </div>

          </div>
        );
      })}
    </div>
  );
}
