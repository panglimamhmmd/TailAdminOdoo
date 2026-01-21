
import { useState, useEffect } from 'react';

// ======================
// Types (Copied/Shared from page.tsx to ensure consistency, 
// ideally should be in a shared types file but kept here for self-containment as per current structure)
// ======================

export interface PaymentStatusDetail {
  amount: number;
  count: number;
}

export interface PaymentStatus {
  paid: PaymentStatusDetail;
  unpaid: PaymentStatusDetail;
  partial: PaymentStatusDetail;
  draft: PaymentStatusDetail;
}

export interface ProjectSummary {
  projectName: string;
  category: string;
  stage: string;
  RAB: number;
  progress: number;
  invoice: PaymentStatus;
  vendorBills: PaymentStatus;
  pekerja: PaymentStatus;
  pelaksana: PaymentStatus;
  committedCosts: number;
}

interface CashFlowItem {
  date: string;
  amount: number;
}

interface ApiResponse {
  success: boolean;
  data: ProjectSummary[];
  cashFlow: {
    incoming: CashFlowItem[];
    outgoing: CashFlowItem[];
  };
  timestamp: string;
}

export interface DashboardStats {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  avgProgress: number;
  totalRevenue: number;
  totalExpenses: number;
  netBalance: number;
  outstandingInvoices: number; // Unpaid + Partial
  vendorPayables: number; // Unpaid Bills
  budgetRiskCount: number; // Projects with Expense > 90% RAB
  delayedCount: number; // Projects with Stage 'Critical' or similar logic
  committedCosts: number;
  cashFlow: {
    incoming: CashFlowItem[];
    outgoing: CashFlowItem[];
  };
}

export const useDashboardData = () => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/project/summary');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        
        const json: ApiResponse = await response.json();
        const data = json.data;
        setProjects(data);

        // Calculate Aggregates
        const completed = data.filter(p => p.stage === 'Done' || p.progress === 100).length;
        const inProgress = data.length - completed;
        const avgProgress = data.length > 0 
          ? Math.round(data.reduce((acc, p) => acc + p.progress, 0) / data.length) 
          : 0;

        let totalRevenue = 0;
        let totalExpenses = 0;
        let outstandingInvoices = 0;
        let vendorPayables = 0;
        let budgetRiskCount = 0;
        let delayedCount = 0;
        let totalCommittedCosts = 0;

        const getTotal = (s: PaymentStatus) => s.paid.amount + s.unpaid.amount + s.partial.amount + s.draft.amount;
        const getUnpaid = (s: PaymentStatus) => s.unpaid.amount + s.partial.amount;

        data.forEach(p => {
          // Financials
          const revenue = getTotal(p.invoice);
          const expenses = getTotal(p.vendorBills) + getTotal(p.pekerja) + getTotal(p.pelaksana);
          
          totalRevenue += revenue;
          totalExpenses += expenses;
          outstandingInvoices += getUnpaid(p.invoice);
          vendorPayables += getUnpaid(p.vendorBills); 
          totalCommittedCosts += p.committedCosts;

          // Risk Logic: Expense + Committed > Budget (or > 90% budget)
          const totalLiability = expenses + p.committedCosts;
          if (p.RAB > 0 && totalLiability > (p.RAB * 0.9)) {
            budgetRiskCount++;
          }
          if (p.stage === 'Critical' || (p.progress < 20 && p.stage !== 'New')) {
             delayedCount++; 
          }
        });

        setStats({
          totalProjects: data.length,
          completedProjects: completed,
          inProgressProjects: inProgress,
          avgProgress,
          totalRevenue,
          totalExpenses,
          netBalance: totalRevenue - totalExpenses,
          outstandingInvoices,
          vendorPayables,
          budgetRiskCount,
          delayedCount,
          committedCosts: totalCommittedCosts,
          cashFlow: json.cashFlow || { incoming: [], outgoing: [] }
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { projects, stats, loading, error };
};
