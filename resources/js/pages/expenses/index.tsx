import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, ReceiptText, Trash2 } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatDate, formatMoney } from '@/lib/money';
import { index as expensesIndex } from '@/routes/expenses';
import expenses from '@/routes/expenses';
import type { CategoryOption, ExpenseRow } from '@/types';

type Props = {
    month: string;
    categoryId: number | null;
    expenses: ExpenseRow[];
    categories: CategoryOption[];
    total: number;
};

type ExpenseForm = {
    category_id: string;
    amount: string;
    spent_on: string;
    description: string;
};

function ExpenseDialog({
    open,
    onOpenChange,
    categories,
    month,
    expense,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: CategoryOption[];
    month: string;
    expense: ExpenseRow | null;
}) {
    const form = useForm<ExpenseForm>({
        category_id: expense?.category_id
            ? String(expense.category_id)
            : categories[0]
              ? String(categories[0].id)
              : '',
        amount: expense ? String(expense.amount) : '',
        spent_on: expense?.spent_on ?? `${month}-01`,
        description: expense?.description ?? '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };

        if (expense) {
            form.put(expenses.update.url({ expense: expense.id }), options);
        } else {
            form.post(expenses.store.url(), options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {expense ? 'Edit expense' : 'Add expense'}
                    </DialogTitle>
                    <DialogDescription>
                        Track what you spent and where it went.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="category_id">Category</Label>
                        <Select
                            value={form.data.category_id}
                            onValueChange={(value) =>
                                form.setData('category_id', value)
                            }
                        >
                            <SelectTrigger id="category_id" className="w-full">
                                <SelectValue placeholder="Choose a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={String(category.id)}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.category_id} />
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
                        <Label htmlFor="spent_on">Date</Label>
                        <Input
                            id="spent_on"
                            type="date"
                            value={form.data.spent_on}
                            onChange={(event) =>
                                form.setData('spent_on', event.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.spent_on} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                            placeholder="Optional note"
                        />
                        <InputError message={form.errors.description} />
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
                            {expense ? 'Save changes' : 'Add expense'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Expenses({
    month,
    categoryId,
    expenses: rows,
    categories,
    total,
}: Props) {
    const { currency } = usePage<{ currency: string }>().props;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<ExpenseRow | null>(null);
    const [deleting, setDeleting] = useState<ExpenseRow | null>(null);

    const openNew = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (expense: ExpenseRow) => {
        setEditing(expense);
        setDialogOpen(true);
    };

    const remove = (expense: ExpenseRow) => {
        router.delete(expenses.destroy.url({ expense: expense.id }), {
            preserveScroll: true,
        });
    };

    const filterCategory = (value: string) => {
        router.get(
            expensesIndex.url(),
            {
                month,
                category_id: value === 'all' ? undefined : value,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Expenses" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Expenses
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {formatMoney(total, currency)} spent this month.
                        </p>
                    </div>

                    <Button onClick={openNew}>
                        <Plus />
                        Add expense
                    </Button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <MonthPicker
                        month={month}
                        url={expensesIndex.url()}
                        extraQuery={{ category_id: categoryId }}
                    />

                    <Select
                        value={categoryId ? String(categoryId) : 'all'}
                        onValueChange={filterCategory}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={String(category.id)}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {rows.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
                        <ReceiptText className="size-8 text-muted-foreground" />
                        <div>
                            <p className="font-medium">No expenses yet</p>
                            <p className="text-sm text-muted-foreground">
                                Add an expense to start tracking this month.
                            </p>
                        </div>
                        <Button onClick={openNew} variant="outline">
                            <Plus />
                            Add expense
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y rounded-xl border bg-card">
                        {rows.map((expense) => (
                            <div
                                key={expense.id}
                                className="flex flex-wrap items-center gap-3 p-4"
                            >
                                <span
                                    className="flex size-9 shrink-0 items-center justify-center rounded-full"
                                    style={{
                                        backgroundColor: `${expense.color}1f`,
                                        color: expense.color,
                                    }}
                                >
                                    <ReceiptText className="size-4" />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {expense.description ||
                                            expense.category}
                                    </p>
                                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span
                                            className="size-2 rounded-full"
                                            style={{
                                                backgroundColor: expense.color,
                                            }}
                                        />
                                        {expense.category} ·{' '}
                                        {formatDate(expense.spent_on)}
                                    </p>
                                </div>

                                <span className="text-sm font-semibold tabular-nums">
                                    {formatMoney(expense.amount, currency)}
                                </span>

                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Edit expense"
                                        onClick={() => openEdit(expense)}
                                    >
                                        <Pencil />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Delete expense"
                                        onClick={() => setDeleting(expense)}
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
                <ExpenseDialog
                    key={editing?.id ?? 'new'}
                    open={dialogOpen}
                    onOpenChange={(open) => {
                        setDialogOpen(open);

                        if (!open) {
                            setEditing(null);
                        }
                    }}
                    categories={categories}
                    month={month}
                    expense={editing}
                />
            )}

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleting(null);
                    }
                }}
                title="Delete expense?"
                description={
                    deleting
                        ? `"${deleting.description || deleting.category}" will be permanently removed.`
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

Expenses.layout = {
    breadcrumbs: [
        {
            title: 'Expenses',
            href: expensesIndex(),
        },
    ],
};
