import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { formatMoney } from '@/lib/money';
import type { TrendPoint } from '@/types';

type Props = {
    data: TrendPoint[];
    currency: string;
};

export default function MonthlyTrendChart({ data, currency }: Props) {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} barGap={4}>
                <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                />
                <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    width={80}
                    tickFormatter={(value) =>
                        formatMoney(Number(value), currency)
                    }
                />
                <Tooltip
                    formatter={(value) => formatMoney(Number(value), currency)}
                />
                <Legend />
                <Bar
                    dataKey="income"
                    name="Income"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                />
                <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
