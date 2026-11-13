import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatMonth, shiftMonth } from '@/lib/money';

type Props = {
    month: string;
    url: string;
    extraQuery?: Record<string, string | number | null | undefined>;
};

export default function MonthPicker({ month, url, extraQuery = {} }: Props) {
    const visit = (nextMonth: string) => {
        const query: Record<string, string | number | null | undefined> = {
            ...extraQuery,
            month: nextMonth,
        };

        router.get(url, query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Previous month"
                onClick={() => visit(shiftMonth(month, -1))}
            >
                <ChevronLeft />
            </Button>

            <div className="min-w-36 text-center text-sm font-medium">
                {formatMonth(month)}
            </div>

            <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Next month"
                onClick={() => visit(shiftMonth(month, 1))}
            >
                <ChevronRight />
            </Button>

            <Input
                type="month"
                value={month}
                className="w-auto"
                aria-label="Jump to month"
                onChange={(event) => {
                    if (event.target.value) {
                        visit(event.target.value);
                    }
                }}
            />
        </div>
    );
}
