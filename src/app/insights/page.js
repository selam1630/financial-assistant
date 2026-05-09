"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useBusinessData } from "@/lib/useBusinessData";

export default function InsightsPage() {
  const { dashboard, loading } = useBusinessData();

  const trends = useMemo(() => {
    const totals = {};
    dashboard?.allTransactions.forEach((transaction) => {
      if (!totals[transaction.product_name]) {
        totals[transaction.product_name] = { quantity: 0, revenue: 0 };
      }
      totals[transaction.product_name].quantity += Number(transaction.quantity);
      totals[transaction.product_name].revenue += Number(transaction.total);
    });

    return Object.entries(totals)
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [dashboard?.allTransactions]);

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f4ee]">Loading insights...</main>;
  }

  const lowPerforming = dashboard?.products.filter(
    (product) => !trends.some((trend) => trend.name.toLowerCase() === product.name.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 text-[#151515] md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 border-b border-[#d8d0c2] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#ad4d3b]">Business intelligence</p>
            <h1 className="mt-2 text-3xl font-semibold">Insights</h1>
          </div>
          <nav className="flex gap-2">
            <Link href="/transaction" className="nav-button">+ Sale</Link>
            <Link href="/dashboard" className="nav-button secondary">Dashboard</Link>
          </nav>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-[#d8d0c2] bg-white p-5">
            <h2 className="text-xl font-semibold">Trends</h2>
            <div className="mt-4 space-y-3">
              {trends.length ? (
                trends.slice(0, 5).map((trend, index) => (
                  <div key={trend.name} className="rounded-md border border-[#ebe4d8] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold">{index + 1}. {trend.name}</p>
                      <span className="status ok">{trend.quantity} sold</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-[#eee6d8]">
                      <div
                        className="h-full rounded-full bg-[#2f7d68]"
                        style={{ width: `${Math.min(100, trend.quantity * 20)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-md bg-[#fffdf8] px-4 py-8 text-center text-[#65605a]">
                  Trends appear after transactions are recorded.
                </p>
              )}
            </div>

            <h2 className="mt-6 text-xl font-semibold">Low performers</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {lowPerforming?.length ? (
                lowPerforming.map((product) => (
                  <span key={product.id} className="status warn">{product.name}</span>
                ))
              ) : (
                <p className="text-sm text-[#65605a]">No low-performing products yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[#d8d0c2] bg-[#151515] p-5 text-white">
            <h2 className="text-xl font-semibold">AI suggestions</h2>
            <div className="mt-4 grid gap-3">
              {dashboard?.insights.length ? (
                dashboard.insights.map((insight) => (
                  <article key={insight.id} className="rounded-md bg-white/10 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#f0c65a]">{insight.type}</p>
                    <p className="mt-2 text-[#f8f4ec]">{insight.message}</p>
                  </article>
                ))
              ) : (
                <>
                  <article className="rounded-md bg-white/10 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#f0c65a]">Demo idea</p>
                    <p className="mt-2 text-[#f8f4ec]">Record “Sold 3 coffees” to create a live sales and stock insight.</p>
                  </article>
                  <article className="rounded-md bg-white/10 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#f0c65a]">Next step</p>
                    <p className="mt-2 text-[#f8f4ec]">Low stock and top-product suggestions will appear automatically.</p>
                  </article>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
