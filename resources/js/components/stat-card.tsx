import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
    title: string;
    value: string;
    hint?: string;
    icon: LucideIcon;
    tone?: 'default' | 'positive' | 'negative';
};

export default function StatCard({
    title,
    value,
    hint,
    icon: Icon,
    tone = 'default',
}: Props) {
    return (
        <Card className="gap-3 py-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <span className="flex size-8 items-center justify-center rounded-md bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                </span>
            </CardHeader>
            <CardContent>
                <p
                    className={cn(
                        'text-2xl font-semibold tracking-tight',
                        tone === 'positive' &&
                            'text-emerald-600 dark:text-emerald-400',
                        tone === 'negative' && 'text-red-600 dark:text-red-400',
                    )}
                >
                    {value}
                </p>
                {hint && (
                    <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
                )}
            </CardContent>
        </Card>
    );
}
