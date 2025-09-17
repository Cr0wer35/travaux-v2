export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  room: string;
  supplier: string;
  description: string;
  invoiceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  category?: string;
  room?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  children?: Budget[];
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  categories: {
    [key: string]: {
      budget: number;
      spent: number;
      remaining: number;
    };
  };
  rooms: {
    [key: string]: {
      budget: number;
      spent: number;
      remaining: number;
    };
  };
  budgetHierarchy: Budget[];
}

export type ViewMode = 'dashboard' | 'budget' | 'expenses';