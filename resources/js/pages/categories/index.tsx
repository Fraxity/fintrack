import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import InputError from '@/components/input-error';
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
import categories from '@/routes/categories';
import { index as categoriesIndex } from '@/routes/categories';
import type { CategoryRow } from '@/types';

type Props = {
    categories: CategoryRow[];
};

type CategoryForm = {
    name: string;
    color: string;
};

const colorPresets = [
    '#6366f1',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#06b6d4',
    '#ec4899',
    '#8b5cf6',
    '#f97316',
    '#14b8a6',
    '#94a3b8',
];

function CategoryDialog({
    open,
    onOpenChange,
    category,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: CategoryRow | null;
}) {
    const form = useForm<CategoryForm>({
        name: category?.name ?? '',
        color: category?.color ?? colorPresets[0],
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };

        if (category) {
            form.put(categories.update.url({ category: category.id }), options);
        } else {
            form.post(categories.store.url(), options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {category ? 'Edit category' : 'New category'}
                    </DialogTitle>
                    <DialogDescription>
                        Categories keep your spending organised.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="category-name">Name</Label>
                        <Input
                            id="category-name"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            placeholder="e.g. Groceries"
                            required
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category-color">Color</Label>
                        <div className="flex flex-wrap items-center gap-2">
                            {colorPresets.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    aria-label={`Use color ${color}`}
                                    className="size-7 rounded-full ring-offset-2 ring-offset-background transition"
                                    style={{ backgroundColor: color }}
                                    onClick={() => form.setData('color', color)}
                                >
                                    {form.data.color === color && (
                                        <span className="mx-auto block size-2.5 rounded-full bg-white" />
                                    )}
                                </button>
                            ))}
                            <Input
                                id="category-color"
                                type="color"
                                className="h-8 w-14 p-1"
                                value={form.data.color}
                                onChange={(event) =>
                                    form.setData('color', event.target.value)
                                }
                            />
                        </div>
                        <InputError message={form.errors.color} />
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
                            {category ? 'Save changes' : 'Add category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Categories({ categories: rows }: Props) {
    const { currency } = usePage<{ currency: string }>().props;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<CategoryRow | null>(null);
    const [deleting, setDeleting] = useState<CategoryRow | null>(null);

    const openNew = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (category: CategoryRow) => {
        setEditing(category);
        setDialogOpen(true);
    };

    return (
        <>
            <Head title="Categories" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Categories
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Organise your expenses so reports stay useful.
                        </p>
                    </div>

                    <Button onClick={openNew}>
                        <Plus />
                        New category
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {rows.map((category) => (
                        <div
                            key={category.id}
                            className="rounded-xl border bg-card p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <span
                                        className="flex size-9 shrink-0 items-center justify-center rounded-full"
                                        style={{
                                            backgroundColor: `${category.color}1f`,
                                            color: category.color,
                                        }}
                                    >
                                        <Tags className="size-4" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">
                                            {category.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {category.expenses_count}{' '}
                                            {category.expenses_count === 1
                                                ? 'expense'
                                                : 'expenses'}{' '}
                                            ·{' '}
                                            {formatMoney(
                                                category.expenses_sum_amount,
                                                currency,
                                            )}{' '}
                                            all time
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Edit category"
                                        onClick={() => openEdit(category)}
                                    >
                                        <Pencil />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Delete category"
                                        onClick={() => setDeleting(category)}
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {dialogOpen && (
                <CategoryDialog
                    key={editing?.id ?? 'new'}
                    open={dialogOpen}
                    onOpenChange={(open) => {
                        setDialogOpen(open);

                        if (!open) {
                            setEditing(null);
                        }
                    }}
                    category={editing}
                />
            )}

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleting(null);
                    }
                }}
                title="Delete category?"
                description={
                    deleting
                        ? `"${deleting.name}" will be removed. Its expenses stay, but become uncategorized.`
                        : ''
                }
                onConfirm={() => {
                    if (deleting) {
                        router.delete(
                            categories.destroy.url({ category: deleting.id }),
                            { preserveScroll: true },
                        );
                    }
                }}
            />
        </>
    );
}

Categories.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: categoriesIndex(),
        },
    ],
};
