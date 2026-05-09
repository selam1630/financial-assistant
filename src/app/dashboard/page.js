"use client";

import Link from "next/link";
import { useBusinessData } from "@/lib/useBusinessData";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export default function DashboardPage() {
  const { user, dashboard, loading, error } = useBusinessData();

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f4ee]">Loading dashboard...</main>;
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f4ee] px-5 text-center">
        <div>
          <h1 className="text-3xl font-semibold">Start with a business name</h1>
          <Link className="mt-5 inline-flex rounded-md bg-[#151515] px-5 py-3 font-semibold text-white" href="/">
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  const lowStock = dashboard.products.filter((product) => Number(product.stock) <= 5);

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#151515]">
      <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
        <header className="flex flex-col gap-4 border-b border-[#d8d0c2] pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f7d68]">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold md:text-5xl">{user.business_name}</h1>
            <p className="mt-1 text-[#65605a]">{user.business_type}</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            <Link className="nav-button" href="/transaction">+ Sale</Link>
            <Link className="nav-button secondary" href="/inventory">Stock</Link>
            <Link className="nav-button secondary" href="/insights">Insights</Link>
          </nav>
        </header>

        {error ? <p className="mt-4 rounded-md bg-[#fff1f0] px-4 py-3 text-sm text-[#b42318]">{error}</p> : null}

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <Stat label="Sales today" value={money.format(dashboard.totalSalesToday)} tone="green" />
          <Stat label="Transactions" value={dashboard.transactionCount} />
          <Stat label="Best product" value={dashboard.bestSellingProduct} tone="coral" />
          <Stat label="Est. profit" value={money.format(dashboard.estimatedProfit)} tone="gold" />
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-[#d8d0c2] bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Stock overview</h2>
              <Link href="/inventory" className="text-sm font-semibold text-[#2f7d68]">Manage</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-[#ebe4d8] text-[#65605a]">
                  <tr>
                    <th className="py-3 font-medium">Product</th>
                    <th className="py-3 font-medium">Price</th>
                    <th className="py-3 font-medium">Stock</th>
                    <th className="py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.products.length ? (
                    dashboard.products.map((product) => (
                      <tr key={product.id} className="border-b border-[#f1ece4] last:border-0">
                        <td className="py-3 font-semibold">{product.name}</td>
                        <td className="py-3">{money.format(Number(product.price))}</td>
                        <td className="py-3">{product.stock}</td>
                        <td className="py-3">
                          <span className={Number(product.stock) <= 5 ? "status danger" : "status ok"}>
                            {Number(product.stock) <= 5 ? "Low stock" : "Ready"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-8 text-center text-[#65605a]" colSpan="4">
                        Add products or record a sale to start tracking stock.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-lg border border-[#d8d0c2] bg-[#151515] p-5 text-white">
              <h2 className="text-xl font-semibold">AI insights</h2>
              <div className="mt-4 space-y-3">
                {dashboard.insights.length ? (
                  dashboard.insights.slice(0, 4).map((insight) => (
                    <p key={insight.id} className="rounded-md bg-white/10 p-3 text-sm text-[#f8f4ec]">
                      {insight.message}
                    </p>
                  ))
                ) : (
                  <p className="rounded-md bg-white/10 p-3 text-sm text-[#f8f4ec]">
                    Record a sale to generate the first recommendation.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-[#d8d0c2] bg-white p-5">
              <h2 className="text-xl font-semibold">Low stock alerts</h2>
              <div className="mt-4 space-y-3">
                {lowStock.length ? (
                  lowStock.map((product) => (
                    <div key={product.id} className="flex items-center justify-between rounded-md bg-[#fff7e3] px-3 py-3 text-sm">
                      <span className="font-semibold">{product.name}</span>
                      <span>{product.stock} left</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#65605a]">All tracked products have enough stock.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, tone = "ink" }) {
  return (
    <div className={`stat-card ${tone}`}>
      <p className="text-sm font-medium text-[#65605a]">{label}</p>
      <p className="mt-3 min-h-10 break-words text-2xl font-semibold">{value}</p>
    </div>
  );
}
