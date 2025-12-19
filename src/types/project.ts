export interface FinanceGroup {
    journal_id: [number, string];
    status_in_payment: string;
    amount_total: number;
    __count: number;
}

export interface FinanceSummary {
    totalAmount: number;
    totalInvoices: number;
    byStatus: Record<string, number>;
    byJournal: Record<string, number>;
}

export interface Task {
    id: number;
    name: string;
    x_studio_persentase?: number;
    x_studio_bobot?: number;
    x_studio_progress?: number;
}

export interface Client {
    name: string;
}

export interface ProjectDetails {
    id: number;
    name: string;
    date_start?: string;
    date?: string;
    user_id?: [number, string];
    partner_id?: [number, string];
    tag_ids: number[];
    x_studio_related_field_180_1j3l9t4is?: number;
    x_progress_project?: number;
}

export interface SubProject {
    id: number;
    soCode: string;
    type: 'construction' | 'design' | 'interior' | 'other';
    fullName: string;
    details: ProjectDetails | null;
    finances: {
        groups: FinanceGroup[];
        summary: FinanceSummary;
    };
    tasks: Task[];
    client: Client | null;
}

export interface ProjectData {
    success: boolean;
    projectName: string;
    subProjects: SubProject[];
    count: number;
}
