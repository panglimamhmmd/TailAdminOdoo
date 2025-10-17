"use client";

import React, { useEffect, useState } from "react";

// -------------------- TYPES --------------------
interface PaymentStatusGroup {
  status: string;
  total_amount: number;
  invoice_count: number;
}

interface JournalGroup {
  journal_id: number;
  journal_name: string;
  summary_by_status: PaymentStatusGroup[];
  total_amount: number;
  invoice_count: number;
}

interface InvoiceSummary {
  journals: JournalGroup[];
  grand_total: number;
  total_invoices: number;
}

interface ProjectTask {
  id: number;
  name: string;
  stage_id?: [number, string];
  date_deadline?: string;
  priority?: string;
}

interface ProjectDetail {
  id: number;
  name: string;
  stage_id?: [number, string];
  user_id?: [number, string];
  partner_id?: [number, string];
  date_start?: string;
  date?: string;
  tag_ids?: number[];
}

interface DetailedProject {
  project: ProjectDetail | null;
  invoice_summary: InvoiceSummary;
  tasks: ProjectTask[];
  invoices_count: number;
  tasks_count: number;
}

interface ProjectDetailsProps {
  params: Promise<{ projectname: string }>;
}

type TabType = "design" | "construction" | "interior";

interface GroupedProjects {
  design?: DetailedProject;
  construction?: DetailedProject;
  interior?: DetailedProject;
}

// -------------------- COMPONENT --------------------
const ProjectDetailsPage: React.FC<ProjectDetailsProps> = ({ params }) => {
  const [projectName, setProjectName] = useState<string>("");
  const [projects, setProjects] = useState<DetailedProject[]>([]);
  const [groupedProjects, setGroupedProjects] = useState<GroupedProjects>({});
  const [extractedProjectName, setExtractedProjectName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("design");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadParams = async () => {
      const resolved = await params;
      setProjectName(resolved.projectname);
    };
    loadParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (projectName) fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectName]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projectdetail/${projectName}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");

      setProjects(data.projects || []);
      groupProjectsByTag(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setProjects([]);
      setGroupedProjects({});
    } finally {
      setLoading(false);
    }
  };

  const groupProjectsByTag = (projectsList: DetailedProject[]) => {
    const grouped: GroupedProjects = {};
    projectsList.forEach((p) => {
      const tagIds = p.project?.tag_ids || [];

      if (p.project?.name && !extractedProjectName) {
        const parts = p.project.name.split(" - ");
        setExtractedProjectName(parts.length > 1 ? parts.slice(1).join(" - ") : p.project.name);
      }

      if (tagIds.includes(1)) grouped.construction = p;
      else if (tagIds.includes(2)) grouped.interior = p;
      else if (tagIds.includes(3)) grouped.design = p;
    });
    setGroupedProjects(grouped);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("paid") && !s.includes("unpaid")) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (s.includes("progress") || s.includes("in_progress")) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    if (s.includes("cancel")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  };

  // -------------------- FINANCE DASHBOARD UI (Notion-like compact) --------------------
  // Logic: classify journals -> invoices (income) vs costs (project cost) (any journal name containing 'invoice' treated as income)
  const FinanceOverviewCard = ({ project }: { project: DetailedProject }) => {
    const journals = project.invoice_summary.journals || [];

    // classify
    const invoiceJournals = journals.filter((j) => /invoice/i.test(j.journal_name));
    const costJournals = journals.filter((j) => !/invoice/i.test(j.journal_name));

    // totals
    const totalInvoices = invoiceJournals.reduce((s, j) => s + (j.total_amount || 0), 0);
    const totalCosts = costJournals.reduce((s, j) => s + (j.total_amount || 0), 0);
    const net = totalInvoices - totalCosts;

    // Helper to compute paid/unpaid per group (we'll aggregate status groups)
    const aggregateStatus = (journalList: JournalGroup[]) => {
      const result = {
        paid: 0,
        unpaid: 0,
        paidCount: 0,
        unpaidCount: 0,
        items: journalList,
      };
      journalList.forEach((j) => {
        j.summary_by_status.forEach((s) => {
          const st = s.status.toLowerCase();
          if (st.includes("paid") && !st.includes("unpaid")) {
            result.paid += s.total_amount || 0;
            result.paidCount += s.invoice_count || 0;
          } else if (st.includes("unpaid") || st.includes("draft") || st.includes("to_pay")) {
            result.unpaid += s.total_amount || 0;
            result.unpaidCount += s.invoice_count || 0;
          } else {
            // fallback: treat non-paid as unpaid-ish
            if (!st.includes("paid")) {
              result.unpaid += s.total_amount || 0;
              result.unpaidCount += s.invoice_count || 0;
            }
          }
        });
      });
      return result;
    };

    const invoiceAgg = aggregateStatus(invoiceJournals);
    const costAgg = aggregateStatus(costJournals);

    return (
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
        {/* Top summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400">📉 Total Project Cost</div>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <div className="text-lg font-semibold text-red-600 dark:text-red-400">{formatCurrency(totalCosts)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Expense (all cost journals)</div>
              </div>
              <div className="text-sm text-red-400 bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded-md">Cost</div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400">💸 Total Invoices</div>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(totalInvoices)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Income (invoice journals)</div>
              </div>
              <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded-md">Income</div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400">⚖️ Net Balance</div>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <div className={`text-lg font-semibold ${net >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}>
                  {formatCurrency(net)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Income - Cost</div>
              </div>
              <div className={`text-sm px-2 py-1 rounded-md ${net >= 0 ? "bg-blue-50 dark:bg-blue-900/10 text-blue-600" : "bg-red-50 dark:bg-red-900/10 text-red-600"}`}>
                {net >= 0 ? "Positive" : "Deficit"}
              </div>
            </div>
          </div>
        </div>

        {/* Compact details: Cost (Paid/Unpaid) and Invoices (Paid/Unpaid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Project Cost summary */}
          <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Project Cost</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">Expense journals</span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">Paid</div>
                <div className="mt-1 font-semibold text-green-600 dark:text-green-400">{formatCurrency(costAgg.paid)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{costAgg.paidCount} invoice(s)</div>
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">Unpaid</div>
                <div className="mt-1 font-semibold text-red-600 dark:text-red-400">{formatCurrency(costAgg.unpaid)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{costAgg.unpaidCount} invoice(s)</div>
              </div>
            </div>

            {/* mini list of cost journals (compact) */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {costJournals.length === 0 ? (
                <div className="text-xs text-gray-500 dark:text-gray-400">No cost journals</div>
              ) : (
                costJournals.map((j) => (
                  <div key={j.journal_id} className="p-2 rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="truncate font-medium text-gray-800 dark:text-gray-100">{j.journal_name}</div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(j.total_amount)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{j.invoice_count} inv</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Invoices summary */}
          <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Invoices (Income)</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">Incoming payments</span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">Received</div>
                <div className="mt-1 font-semibold text-green-600 dark:text-green-400">{formatCurrency(invoiceAgg.paid)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{invoiceAgg.paidCount} invoice(s)</div>
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                <div className="mt-1 font-semibold text-yellow-600 dark:text-yellow-400">{formatCurrency(invoiceAgg.unpaid)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{invoiceAgg.unpaidCount} invoice(s)</div>
              </div>
            </div>

            {/* mini list of invoice journals (compact) */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {invoiceJournals.length === 0 ? (
                <div className="text-xs text-gray-500 dark:text-gray-400">No invoice journals</div>
              ) : (
                invoiceJournals.map((j) => (
                  <div key={j.journal_id} className="p-2 rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="truncate font-medium text-gray-800 dark:text-gray-100">{j.journal_name}</div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(j.total_amount)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{j.invoice_count} inv</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // -------------------- RENDER PROJECT CONTENT --------------------
  const renderProjectContent = (project: DetailedProject | undefined) => {
    if (!project) {
      return <div className="text-center py-12 text-gray-500 dark:text-gray-400">No data available for this category</div>;
    }

    return (
      <div>
        {/* Finance overview dashboard */}
        <FinanceOverviewCard project={project} />

        {/* Tasks section — tetap seperti versi awal (no change) */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">📋 Tasks ({project.tasks_count})</h2>
          {project.tasks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-xl">No tasks available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {project.tasks.map((task) => (
                <div key={task.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400/50 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-sm line-clamp-2 flex-1">{task.name}</p>
                    {task.stage_id && <span className={`text-xs px-2 py-1 rounded-full ml-2 ${getStatusColor(task.stage_id[1])}`}>{task.stage_id[1]}</span>}
                  </div>
                  <div className="space-y-1 mt-3">
                    {task.date_deadline && <p className="text-xs text-gray-500 dark:text-gray-400">📅 Due: {new Date(task.date_deadline).toLocaleDateString("id-ID")}</p>}
                    {task.priority && <p className="text-xs text-gray-600 dark:text-gray-400">Priority: <span className="font-medium capitalize">{task.priority}</span></p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // -------------------- LOADING / ERROR / EMPTY --------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error</h2>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button onClick={fetchProjects} className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors font-medium">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Project Not Found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              No project found with name: <strong>{decodeURIComponent(projectName || "")}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------- MAIN LAYOUT --------------------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
          {/* Header */}
          <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{extractedProjectName || projectName}</h1>
            <div className="flex gap-2 items-center flex-wrap">
              {projects[0]?.project?.stage_id && <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">{projects[0].project.stage_id[1]}</span>}
              {projects[0]?.project?.user_id && <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium">👤 {projects[0].project.user_id[1]}</span>}
              {projects[0]?.project?.partner_id && <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-medium">🏢 {projects[0].project.partner_id[1]}</span>}
            </div>
            {projects[0]?.project?.date_start && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Started: {new Date(projects[0].project.date_start).toLocaleDateString("id-ID")}</p>}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="grid grid-cols-3 text-center">
              {(["design", "construction", "interior"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 font-medium text-sm border-b-2 transition-all ${
                    activeTab === tab
                      ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-900"
                      : "text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {tab === "design" ? "🎨 Design" : tab === "construction" ? "🔨 Construction" : "🏠 Interior"}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            {activeTab === "design" && renderProjectContent(groupedProjects.design)}
            {activeTab === "construction" && renderProjectContent(groupedProjects.construction)}
            {activeTab === "interior" && renderProjectContent(groupedProjects.interior)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
