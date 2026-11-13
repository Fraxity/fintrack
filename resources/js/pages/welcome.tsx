import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, PiggyBank, ReceiptText, Wallet } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

const features = [
    {
        title: 'Track every expense',
        description:
            'Log what you spend, tag it with a category, and see the month add up.',
        icon: ReceiptText,
    },
    {
        title: 'Set your wage',
        description:
            'Record your salary and other income so you always know what is coming in.',
        icon: Wallet,
    },
    {
        title: 'Budget with purpose',
        description:
            'Give each category a monthly limit and get a clear warning when you go over.',
        icon: PiggyBank,
    },
    {
        title: 'See the bigger picture',
        description:
            'Charts show where your money goes and how your spending changes over time.',
        icon: BarChart3,
    },
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen bg-background text-foreground">
                <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
                    <AppLogo />

                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <Button asChild>
                                <Link href={dashboard()}>Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href={login()}>Log in</Link>
                                </Button>
                                <Button asChild>
                                    <Link href={register()}>Get started</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </header>

                <main className="mx-auto w-full max-w-6xl px-6">
                    <section className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
                        <div>
                            <span className="mb-4 inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                Personal finance, simplified
                            </span>

                            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
                                Know exactly where your wage goes.
                            </h1>

                            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
                                SpendWise brings your income, expenses, and
                                budgets into one simple monthly view — so you
                                can spend with confidence and save what is left.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Button size="lg" asChild>
                                    <Link href={register()}>
                                        Start tracking free
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href={login()}>
                                        I have an account
                                    </Link>
                                </Button>
                            </div>

                            <p className="mt-4 text-xs text-muted-foreground">
                                Demo account: test@example.com / password
                            </p>
                        </div>

                        <div className="rounded-2xl border bg-card p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        This month
                                    </p>
                                    <p className="text-2xl font-semibold">
                                        $3,200.00
                                    </p>
                                </div>
                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    +$1,284 left
                                </span>
                            </div>

                            <div className="mt-6 space-y-4">
                                {[
                                    ['Home & bills', 42, 'bg-indigo-500'],
                                    ['Groceries', 24, 'bg-emerald-500'],
                                    ['Transport', 16, 'bg-amber-500'],
                                    ['Fun', 18, 'bg-rose-500'],
                                ].map(([label, percent, color]) => (
                                    <div
                                        key={String(label)}
                                        className="space-y-1.5"
                                    >
                                        <div className="flex justify-between text-sm">
                                            <span>{label}</span>
                                            <span className="text-muted-foreground">
                                                {percent}%
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={`h-full rounded-full ${color}`}
                                                style={{
                                                    width: `${percent}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="rounded-xl border bg-card p-5"
                            >
                                <span className="mb-4 flex size-9 items-center justify-center rounded-lg bg-muted">
                                    <feature.icon className="size-4.5" />
                                </span>
                                <h2 className="font-medium">{feature.title}</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </section>
                </main>
            </div>
        </>
    );
}
