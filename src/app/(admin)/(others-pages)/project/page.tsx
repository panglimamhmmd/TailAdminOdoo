import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import { ProjectCard } from "@/components/project/ProjectCard";

export const metadata: Metadata = {
  title: "Next.js Blank Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Blank Page TailAdmin Dashboard Template",
};

export default function project() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Project Page" />
      
      {/* Grid Container dengan Responsive */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 ">
        <ProjectCard 
          projectName="Villa Modern Minimalis"
          progressDesign={85}
          progressConstruction={60}
          progressInterior={30}
          deadline="2025-12-31"
        />
        <ProjectCard 
          projectName="Rumah Tropis 2 Lantai"
          progressDesign={100}
          progressConstruction={45}
          progressInterior={15}
          deadline="2026-03-15"
        />
        <ProjectCard 
          projectName="Apartemen City View"
          progressDesign={70}
          progressConstruction={20}
          progressInterior={0}
          deadline="2026-06-20"
        />
        <ProjectCard 
          projectName="Apartemen City View"
          progressDesign={70}
          progressConstruction={20}
          progressInterior={0}
          deadline="2026-06-20"
        />
        <ProjectCard 
          projectName="Apartemen City View"
          progressDesign={70}
          progressConstruction={20}
          progressInterior={0}
          deadline="2026-06-20"
        />
        <ProjectCard 
          projectName="Apartemen City View"
          progressDesign={70}
          progressConstruction={20}
          progressInterior={0}
          deadline="2026-06-20"
        />
        <ProjectCard 
          projectName="Apartemen City View"
          progressDesign={70}
          progressConstruction={20}
          progressInterior={0}
          deadline="2026-06-20"
        />
        <ProjectCard 
          projectName="Apartemen City View"
          progressDesign={70}
          progressConstruction={20}
          progressInterior={0}
          deadline="2026-06-20"
        />
        <ProjectCard 
          projectName="Apartemen City View"
          progressDesign={70}
          progressConstruction={20}
          progressInterior={0}
          deadline="2026-06-20"
        />
        <ProjectCard 
          projectName="Apartemen City View"
          progressDesign={70}
          progressConstruction={20}
          progressInterior={0}
          deadline="2026-06-20"
        />
        <ProjectCard 
          projectName="Apartemen City View"
          progressDesign={70}
          progressConstruction={20}
          progressInterior={0}
          deadline="2026-06-20"
        />
        <ProjectCard 
          projectName="Apartemen City View"
          progressDesign={70}
          progressConstruction={20}
          progressInterior={0}
          deadline="2026-06-20"
        />
      </div>
    </div>
  );
}