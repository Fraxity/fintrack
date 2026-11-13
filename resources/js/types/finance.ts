export type CategoryOption = {
    id: number;
    name: string;
    color: string;
};

export type ExpenseRow = {
    id: number;
    category_id: number | null;
    category: string;
    color: string;
    amount: number;
    spent_on: string;
    description: string | null;
};

export type IncomeRow = {
    id: number;
    source: string;
    amount: number;
    note: string | null;
    month: string;
};

export type BudgetRow = {
    category_id: number;
    name: string;
    color: string;
    budget_id: number | null;
    budget: number | null;
    spent: number;
    remaining: number | null;
    percentage: number | null;
    over_budget: boolean;
};

export type CategoryRow = {
    id: number;
    name: string;
    color: string;
    expenses_count: number;
    expenses_sum_amount: number;
};

export type RecentExpense = {
    id: number;
    description: string;
    category: string;
    color: string;
    amount: number;
    spent_on: string;
};

export type BreakdownItem = {
    name: string;
    color: string;
    total: number;
};

export type TrendPoint = {
    month: string;
    label: string;
    income: number;
    expenses: number;
};

export type DashboardBudget = {
    id: number;
    category: string;
    color: string;
    budget: number;
    spent: number;
    remaining: number;
    percentage: number;
    over_budget: boolean;
};
