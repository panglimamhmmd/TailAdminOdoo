"use client";

import React, { useState } from 'react';
import { Building2, Paintbrush, Hammer, Calendar, MapPin, DollarSign, Users, Clock, Wallet, FileText, TrendingUp } from 'lucide-react';

interface ProjectData {
  name: string;
  location: string;
  client: string;
  budget: string;
  startDate: string;
  endDate: string;
  status: string;
  completion: number;
  teamMembers: number;
}

interface ProgressItem {
  label: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  progress: number;
}




interface TabContent {
  
  title: string;
  description: string;
  items: ProgressItem[];
  details: string[];
}

interface Tab {
  id: 'design' | 'construction' | 'interior' | 'finance';
  label: string;
  icon: React.ElementType;
}

interface CostItem {
  category: 'Vendor Bills' | 'Tukang' | 'Pelaksana';
  description: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
}

type TabContentMap = {
  [K in Tab['id']]: TabContent;
};

export default function ProjectDetails(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab['id']>('design');

  // Sample project data
  const projectData: ProjectData = {
    name: "Modern Villa Residence",
    location: "Bali, Indonesia",
    client: "PT. Harmoni Properti",
    budget: "Rp 5.2 Miliar",
    startDate: "15 Januari 2024",
    endDate: "30 September 2024",
    status: "In Progress",
    completion: 65,
    teamMembers: 12
  };

  // Finance data
  const projectCosts: CostItem[] = [
    { category: 'Vendor Bills', description: 'Material Bangunan - Toko Jaya', amount: 450000000, status: 'Paid' },
    { category: 'Vendor Bills', description: 'Cat & Finishing - CV Indah', amount: 125000000, status: 'Pending' },
    { category: 'Vendor Bills', description: 'Plumbing & Sanitasi - PT Tirta', amount: 85000000, status: 'Paid' },
    { category: 'Tukang', description: 'Tukang Batu & Cor (10 orang)', amount: 180000000, status: 'Paid' },
    { category: 'Tukang', description: 'Tukang Kayu (5 orang)', amount: 95000000, status: 'Pending' },
    { category: 'Tukang', description: 'Tukang Listrik & Plumbing (3 orang)', amount: 65000000, status: 'Paid' },
    { category: 'Pelaksana', description: 'Project Manager Fee', amount: 120000000, status: 'Paid' },
    { category: 'Pelaksana', description: 'Site Supervisor Fee', amount: 75000000, status: 'Pending' },
    { category: 'Pelaksana', description: 'Admin & Dokumentasi', amount: 35000000, status: 'Paid' },
  ];

  const invoices: Invoice[] = [
    { id: '1', invoiceNumber: 'INV-2024-001', date: '15 Jan 2024', amount: 1300000000, status: 'Paid', dueDate: '30 Jan 2024' },
    { id: '2', invoiceNumber: 'INV-2024-002', date: '15 Mar 2024', amount: 1300000000, status: 'Paid', dueDate: '30 Mar 2024' },
    { id: '3', invoiceNumber: 'INV-2024-003', date: '15 Jun 2024', amount: 1300000000, status: 'Paid', dueDate: '30 Jun 2024' },
    { id: '4', invoiceNumber: 'INV-2024-004', date: '15 Sep 2024', amount: 1300000000, status: 'Pending', dueDate: '30 Sep 2024' },
  ];

  const tabs: Tab[] = [
    { id: 'design', label: 'Design', icon: Paintbrush },
    { id: 'construction', label: 'Construction', icon: Hammer },
    { id: 'interior', label: 'Interior', icon: Building2 },
    { id: 'finance', label: 'Finance', icon: Wallet }
  ];

  const tabContent: TabContentMap = {
    design: {
      title: "Design Phase",
      description: "Konsep desain arsitektur modern tropis dexngan pendekatan sustainable design",
      items: [
        { label: "Concept Design", status: "Completed", progress: 100 },
        { label: "Schematic Design", status: "Completed", progress: 100 },
        { label: "Design Development", status: "In Progress", progress: 80 },
        { label: "Construction Documents", status: "Pending", progress: 30 }
      ],
      details: [
        "Gaya arsitektur: Modern Tropical",
        "Luas bangunan: 450 m²",
        "Jumlah lantai: 2 lantai",
        "Software: AutoCAD, SketchUp, Revit"
      ]
    },
    construction: {
      title: "Construction Phase",
      description: "Proses pembangunan dengan material berkualitas tinggi dan standar keamanan",
      items: [
        { label: "Site Preparation", status: "Completed", progress: 100 },
        { label: "Foundation Work", status: "Completed", progress: 100 },
        { label: "Structure & Framing", status: "In Progress", progress: 75 },
        { label: "MEP Installation", status: "In Progress", progress: 45 }
      ],
      details: [
        "Kontraktor: CV. Bangun Jaya",
        "Pekerja: 25 orang",
        "Material utama: Beton, baja, kayu jati",
        "Target selesai: 30 September 2024"
      ]
    },
    interior: {
      title: "Interior Phase",
      description: "Desain interior minimalis modern dengan sentuhan natural dan warm tone",
      items: [
        { label: "Space Planning", status: "Completed", progress: 100 },
        { label: "Material Selection", status: "In Progress", progress: 60 },
        { label: "Furniture Design", status: "In Progress", progress: 40 },
        { label: "Installation", status: "Pending", progress: 0 }
      ],
      details: [
        "Tema: Minimalis Modern",
        "Color palette: Earth tone",
        "Furniture: Custom & branded",
        "Lighting: Smart lighting system"
      ]
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: ProgressItem['status'] | CostItem['status'] | Invoice['status']): string => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Pending':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      case 'Overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getProgressColor = (status: ProgressItem['status']): string => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500 dark:bg-green-600';
      case 'In Progress':
        return 'bg-blue-500 dark:bg-blue-600';
      case 'Pending':
        return 'bg-gray-400 dark:bg-gray-600';
      default:
        return 'bg-gray-400 dark:bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      {/* Project Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Project Details</h1>
        <p className="text-gray-600 dark:text-gray-400">Informasi lengkap tentang project dan progres pengerjaan</p>
      </div>

      {/* Main Project Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{projectData.name}</h2>
            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {projectData.location}
            </div>
          </div>
          <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
            {projectData.status}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{projectData.completion}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${projectData.completion}%` }}
            />
          </div>
        </div>

        {/* Project Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Budget</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{projectData.budget}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Start Date</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{projectData.startDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">End Date</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{projectData.endDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Team Size</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{projectData.teamMembers} Members</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Client:</span> {projectData.client}
          </p>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab !== 'finance' ? (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {tabContent[activeTab].title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{tabContent[activeTab].description}</p>
              </div>

              {/* Progress Items */}
              <div className="space-y-4 mb-6">
                {tabContent[activeTab].items.map((item, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(item.status)}`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-right">
                        {item.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Details List */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Detail Informasi</h4>
                <ul className="space-y-2">
                  {tabContent[activeTab].details.map((detail, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                      <span className="inline-block w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Finance Tab Content */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Financial Overview
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Rincian biaya project dan status pembayaran invoice</p>
              </div>

              {/* Finance Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Budget</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{projectData.budget}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-600 dark:bg-green-500 rounded-lg">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-900 dark:text-green-300">Total Spent</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                    {formatCurrency(projectCosts.reduce((sum, cost) => sum + cost.amount, 0))}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-600 dark:bg-orange-500 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-orange-900 dark:text-orange-300">Paid Invoices</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-200">
                    {invoices.filter(inv => inv.status === 'Paid').length} / {invoices.length}
                  </p>
                </div>
              </div>

              {/* Project Costs Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Costs Breakdown</h4>
                
                {/* Vendor Bills */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h5 className="font-semibold text-gray-900 dark:text-white">Vendor Bills</h5>
                  </div>
                  <div className="space-y-2">
                    {projectCosts.filter(cost => cost.category === 'Vendor Bills').map((cost, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{cost.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(cost.amount)}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cost.status)}`}>
                            {cost.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tukang */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h5 className="font-semibold text-gray-900 dark:text-white">Tukang</h5>
                  </div>
                  <div className="space-y-2">
                    {projectCosts.filter(cost => cost.category === 'Tukang').map((cost, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{cost.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(cost.amount)}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cost.status)}`}>
                            {cost.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pelaksana */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Hammer className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <h5 className="font-semibold text-gray-900 dark:text-white">Pelaksana</h5>
                  </div>
                  <div className="space-y-2">
                    {projectCosts.filter(cost => cost.category === 'Pelaksana').map((cost, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{cost.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(cost.amount)}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cost.status)}`}>
                            {cost.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Invoices Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Client Invoices</h4>
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Issued: {invoice.date} • Due: {invoice.dueDate}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(invoice.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}