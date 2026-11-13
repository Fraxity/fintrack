import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import InputError from '@/components/input-error';
import MonthPicker from '@/components/month-picker';
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
import { index as incomesIndex } from '@/routes/incomes';
import incomes from '@/routes/incomes';
import type { IncomeRow } from '@/types';

type Props = {
    month: string;
    incomes: IncomeRow[];
    total: number;
};

type IncomeForm = {
    month: string;
    source: string;
    amount: string;
    note: string;
};

function IncomeDialog({
    open,
    onOpenChange,
    month,
    income,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    month: string;
    income: IncomeRow | null;
}) {
    const form = useForm<IncomeForm>({
        month: income?.month ?? month,
        source: income?.source ?? '',
        amount: income ? String(income.amount) : '',
        note: income?.note ?? '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };

        if (income) {
            form.put(incomes.update.url({ income: income.id }), options);
        } else {
            form.post(incomes.store.url(), options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {income ? 'Edit income' : 'Add income'}
                    </DialogTitle>
                    <DialogDescription>
                        Record your wage, salary, or any other money coming in.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="month">Month</Label>
                        <Input
                            id="month"
                            type="month"
                            value={form.data.month}
                            onChange={(event) =>
                                form.setData('month', event.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.month} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="source">Source</Label>
                        <Input
                            id="source"
                            value={form.data.source}
                            onChange={(event) =>
                                form.setData('source', event.target.value)
                            }
                            placeholder="Salary, freelance, bonus..."
                            required
                        />
                        <InputError message={form.errors.source} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0.01"
                            value={form.data.amount}
                            onChange={(event) =>
                                form.setData('amount', event.target.value)
                            }
                            placeholder="0.00"
                            required
                        />
                        <InputError message={form.errors.amount} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="note">Note</Label>
                        <Input
                            id="note"
                            value={form.data.note}
                            onChange={(event) =>
                                form.setData('note', event.target.value)
                            }
                            placeholder="Optional note"
                        />
                        <InputError message={form.errors.note} />
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
                            {income ? 'Save changes' : 'Add income'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Incomes({ month, incomes: rows, total }: Props) {
    const { currency } = usePage<{ currency: string }>().props;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<IncomeRow | null>(null);
    const [deleting, setDeleting] = useState<IncomeRow | null>(null);

    const openNew = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (income: IncomeRow) => {
        setEditing(income);
        setDialogOpen(true);
    };

    const remove = (income: IncomeRow) => {
        router.delete(incomes.destroy.url({ income: income.id }), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Income" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Income
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {formatMoney(total, currency)} earned this month.
                        </p>
                    </div>

                    <Button onClick={openNew}>
                        <Plus />
                        Add income
                    </Button>
                </div>

                <MonthPicker month={month} url={incomesIndex.url()} />

                {rows.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
                        <Wallet className="size-8 text-muted-foreground" />
                        <div>
                            <p className="font-medium">No income recorded</p>
                            <p className="text-sm text-muted-foreground">
                                Add your wage or salary for this month.
                            </p>
                        </div>
                        <Button onClick={openNew} variant="outline">
                            <Plus />
                            Add income
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y rounded-xl border bg-card">
                        {rows.map((income) => (
                            <div
                                key={income.id}
                                className="flex flex-wrap items-center gap-3 p-4"
                            >
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <Wallet className="size-4" />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {income.source}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {income.note || 'Monthly income'}
                                    </p>
                                </div>

                                <span className="text-sm font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
                                    +{formatMoney(income.amount, currency)}
                                </span>

                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Edit income"
                                        onClick={() => openEdit(income)}
                                    >
                                        <Pencil />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Delete income"
                                        onClick={() => setDeleting(income)}
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {dialogOpen && (
                <IncomeDialog
                    key={editing?.id ?? 'new'}
                    open={dialogOpen}
                    onOpenChange={(open) => {
                        setDialogOpen(open);

                        if (!open) {
                            setEditing(null);
                        }
                    }}
                    month={month}
                    income={editing}
                />
            )}

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleting(null);
                    }
                }}
                title="Delete income?"
                description={
                    deleting
                        ? `"${deleting.source}" will be permanently removed.`
                        : ''
                }
                onConfirm={() => {
                    if (deleting) {
                        remove(deleting);
                    }
                }}
            />
        </>
    );
}

Incomes.layout = {
    breadcrumbs: [
        {
            title: 'Income',
            href: incomesIndex(),
        },
    ],
};
