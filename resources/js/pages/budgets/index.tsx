import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Pencil,
    PiggyBank,
    Plus,
    ReceiptText,
    Target,
    Trash2,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import InputError from '@/components/input-error';
import MonthPicker from '@/components/month-picker';
import StatCard from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';
import budgets from '@/routes/budgets';
import { index as budgetsIndex } from '@/routes/budgets';
import type { BudgetRow } from '@/types';

type Props = {
    month: string;
    rows: BudgetRow[];
    summary: {
        budgeted: number;
        spent: number;
    };
};

type BudgetForm = {
    category_id: number;
    month: string;
    amount: string;
};

function BudgetDialog({
    open,
    onOpenChange,
    month,
    row,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    month: string;
    row: BudgetRow;
}) {
    const form = useForm<BudgetForm>({
        category_id: row.category_id,
        month,
        amount: row.budget !== null ? String(row.budget) : '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.post(budgets.store.url(), {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Budget for {row.name}</DialogTitle>
                    <DialogDescription>
                        Set the most you want to spend in this category this
                        month.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="budget-amount">Monthly budget</Label>
                        <Input
                            id="budget-amount"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                            value={form.data.amount}
                            onChange={(event) =>
                                form.setData('amount', event.target.value)
                            }
                            placeholder="0.00"
                            required
                        />
                        <InputError message={form.errors.amount} />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Save budget
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Budgets({ month, rows, summary }: Props) {
    const { currency } = usePage<{ currency: string }>().props;
    const [editing, setEditing] = useState<BudgetRow | null>(null);
    const [deleting, setDeleting] = useState<BudgetRow | null>(null);

    const remaining = summary.budgeted - summary.spent;

    return (
        <>
            <Head title="Budgets" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Budgets
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Give every category a limit for the month.
                        </p>
                    </div>

                    <MonthPicker month={month} url={budgetsIndex.url()} />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        title="Budgeted"
                        value={formatMoney(summary.budgeted, currency)}
                        icon={Target}
                    />
                    <StatCard
                        title="Spent"
                        value={formatMoney(summary.spent, currency)}
                        icon={ReceiptText}
                    />
                    <StatCard
                        title="Left in budget"
                        value={formatMoney(remaining, currency)}
                        icon={PiggyBank}
                        tone={remaining >= 0 ? 'positive' : 'negative'}
                    />
                </div>

                <div className="divide-y rounded-xl border bg-card">
                    {rows.map((row) => (
                        <div key={row.category_id} className="space-y-3 p-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span
                                    className="size-3 rounded-full"
                                    style={{ backgroundColor: row.color }}
                                />

                                <div className="min-w-0 flex-1">
                                    <p className="flex items-center gap-2 text-sm font-medium">
                                        {row.name}
                                        {row.over_budget && (
                                            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                                                Over budget
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatMoney(row.spent, currency)} spent
                                        {row.budget !== null &&
                                            ` of ${formatMoney(row.budget, currency)}`}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditing(row)}
                                    >
                                        {row.budget === null ? (
                                            <>
                                                <Plus />
                                                Set budget
                                            </>
                                        ) : (
                                            <>
                                                <Pencil />
                                                Edit
                                            </>
                                        )}
                                    </Button>
                                    {row.budget_id !== null && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Remove budget"
                                            onClick={() => setDeleting(row)}
                                        >
                                            <Trash2 />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {row.budget !== null ? (
                                <div className="space-y-1.5">
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all',
                                                row.over_budget
                                                    ? 'bg-red-500'
                                                    : 'bg-emerald-500',
                                            )}
                                            style={{
                                                width: `${row.percentage ?? 0}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {row.over_budget
                                            ? `${formatMoney(
                                                  Math.abs(row.remaining ?? 0),
                                                  currency,
                                              )} over budget`
                                            : `${formatMoney(
                                                  row.remaining ?? 0,
                                                  currency,
                                              )} left`}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    No budget set for this category.
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {editing && (
                <BudgetDialog
                    key={editing.category_id}
                    open={editing !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditing(null);
                        }
                    }}
                    month={month}
                    row={editing}
                />
            )}

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleting(null);
                    }
                }}
                title="Remove budget?"
                description={
                    deleting
                        ? `The ${deleting.name} budget for this month will be removed.`
                        : ''
                }
                confirmLabel="Remove"
                onConfirm={() => {
                    if (deleting?.budget_id) {
                        router.delete(
                            budgets.destroy.url({
                                budget: deleting.budget_id,
                            }),
                            { preserveScroll: true },
                        );
                    }
                }}
            />
        </>
    );
}

Budgets.layout = {
    breadcrumbs: [
        {
            title: 'Budgets',
            href: budgetsIndex(),
        },
    ],
};
