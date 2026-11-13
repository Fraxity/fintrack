import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    PiggyBank,
    ReceiptText,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import MonthlyTrendChart from '@/components/charts/monthly-trend-chart';
import SpendingBreakdownChart from '@/components/charts/spending-breakdown-chart';
import MonthPicker from '@/components/month-picker';
import StatCard from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatDate, formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import budgetsRoute from '@/routes/budgets';
import { index as expensesIndex } from '@/routes/expenses';
import type {
    BreakdownItem,
    DashboardBudget,
    RecentExpense,
    TrendPoint,
} from '@/types';

type Props = {
    month: string;
    summary: {
        income: number;
        expenses: number;
        remaining: number;
        savings_rate: number;
    };
    categoryBreakdown: BreakdownItem[];
    budgets: DashboardBudget[];
    trend: TrendPoint[];
    recentExpenses: RecentExpense[];
};

export default function Dashboard({
    month,
    summary,
    categoryBreakdown,
    budgets,
    trend,
    recentExpenses,
}: Props) {
    const { currency } = usePage<{ currency: string }>().props;

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            A quick look at your money for the month.
                        </p>
                    </div>

                    <MonthPicker month={month} url={dashboard.url()} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Income"
                        value={formatMoney(summary.income, currency)}
                        hint="Wages and other income"
                        icon={Wallet}
                    />
                    <StatCard
                        title="Expenses"
                        value={formatMoney(summary.expenses, currency)}
                        hint="Everything you spent"
                        icon={ReceiptText}
                    />
                    <StatCard
                        title="Remaining"
                        value={formatMoney(summary.remaining, currency)}
                        hint="Income minus expenses"
                        icon={PiggyBank}
                        tone={summary.remaining >= 0 ? 'positive' : 'negative'}
                    />
                    <StatCard
                        title="Savings rate"
                        value={`${summary.savings_rate}%`}
                        hint="Share of income you kept"
                        icon={TrendingUp}
                        tone={
                            summary.savings_rate >= 0 ? 'positive' : 'negative'
                        }
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Spending by category</CardTitle>
                            <CardDescription>
                                Where your money went this month.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SpendingBreakdownChart
                                data={categoryBreakdown}
                                currency={currency}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Income vs expenses</CardTitle>
                            <CardDescription>
                                The last six months at a glance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MonthlyTrendChart
                                data={trend}
                                currency={currency}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between gap-3">
                            <div className="space-y-1">
                                <CardTitle>Budgets</CardTitle>
                                <CardDescription>
                                    How much of each budget you have used.
                                </CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={budgetsRoute.index()}>
                                    Manage
                                    <ArrowRight />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {budgets.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    No budgets set for this month yet.
                                </p>
                            ) : (
                                <ul className="space-y-4">
                                    {budgets.map((budget) => (
                                        <li
                                            key={budget.id}
                                            className="space-y-2"
                                        >
                                            <div className="flex items-center justify-between gap-3 text-sm">
                                                <span className="flex items-center gap-2 font-medium">
                                                    <span
                                                        className="size-2.5 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                budget.color,
                                                        }}
                                                    />
                                                    {budget.category}
                                                </span>
                                                <span className="text-muted-foreground tabular-nums">
                                                    {formatMoney(
                                                        budget.spent,
                                                        currency,
                                                    )}{' '}
                                                    /{' '}
                                                    {formatMoney(
                                                        budget.budget,
                                                        currency,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={cn(
                                                        'h-full rounded-full transition-all',
                                                        budget.over_budget
                                                            ? 'bg-red-500'
                                                            : 'bg-emerald-500',
                                                    )}
                                                    style={{
                                                        width: `${budget.percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between gap-3">
                            <div className="space-y-1">
                                <CardTitle>Recent expenses</CardTitle>
                                <CardDescription>
                                    Your latest spending entries.
                                </CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={expensesIndex()}>
                                    View all
                                    <ArrowRight />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentExpenses.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    Nothing recorded yet. Add your first expense
                                    to get started.
                                </p>
                            ) : (
                                <ul className="divide-y">
                                    {recentExpenses.map((expense) => (
                                        <li
                                            key={expense.id}
                                            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {expense.description}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {expense.category} ·{' '}
                                                    {formatDate(
                                                        expense.spent_on,
                                                    )}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-sm font-medium tabular-nums">
                                                {formatMoney(
                                                    expense.amount,
                                                    currency,
                                                )}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
