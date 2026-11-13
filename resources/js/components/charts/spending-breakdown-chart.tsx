import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatMoney } from '@/lib/money';
import type { BreakdownItem } from '@/types';

type Props = {
    data: BreakdownItem[];
    currency: string;
};

export default function SpendingBreakdownChart({ data, currency }: Props) {
    if (data.length === 0) {
        return (
            <div className="flex h-65 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                No expenses recorded for this month.
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="total"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={2}
                    >
                        {data.map((item) => (
                            <Cell key={item.name} fill={item.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) =>
                            formatMoney(Number(value), currency)
                        }
                    />
                </PieChart>
            </ResponsiveContainer>

            <ul className="space-y-2">
                {data.map((item) => (
                    <li
                        key={item.name}
                        className="flex items-center gap-2 text-sm"
                    >
                        <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="min-w-24 flex-1 text-muted-foreground">
                            {item.name}
                        </span>
                        <span className="font-medium tabular-nums">
                            {formatMoney(item.total, currency)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
