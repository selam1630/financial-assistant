"use client";

import Link from "next/link";
import { useState } from "react";
import { businessApi } from "@/lib/businessStore";
import { useBusinessData } from "@/lib/useBusinessData";

export default function InventoryPage() {
  const { user, dashboard, loading, refresh } = useBusinessData();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const addProduct = async (event) => {
    event.preventDefault();
    setError("");

    if (!user || !name.trim() || Number(price) < 0 || Number(stock) < 0) {
      setError("Enter product name, price, and stock.");
      return;
    }

    try {
      setSaving(true);
      await businessApi.addProduct(user.id, { name, price, stock });
      setName("");
      setPrice("");
      setStock("");
      await refresh();
    } catch (err) {
      setError(err.message || "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const updateStock = async (productId, nextStock) => {
    if (!user) return;
    await businessApi.updateStock(user.id, productId, nextStock);
    await refresh();
  };

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f4ee]">Loading inventory...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 text-[#151515] md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 border-b border-[#d8d0c2] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2f7d68]">Inventory</p>
            <h1 className="mt-2 text-3xl font-semibold">Products and stock</h1>
          </div>
          <nav className="flex gap-2">
            <Link href="/transaction" className="nav-button">+ Sale</Link>
            <Link href="/dashboard" className="nav-button secondary">Dashboard</Link>
          </nav>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
          <form onSubmit={addProduct} className="rounded-lg border border-[#d8d0c2] bg-white p-5">
            <h2 className="text-xl font-semibold">Add product</h2>
            <label className="mt-5 block text-sm font-medium" htmlFor="name">Name</label>
            <input id="name" value={name} onChange={(event) => setName(event.target.value)} className="form-input" placeholder="Bread" />
            <label className="mt-4 block text-sm font-medium" htmlFor="price">Price</label>
            <input id="price" value={price} onChange={(event) => setPrice(event.target.value)} className="form-input" type="number" min="0" step="0.01" />
            <label className="mt-4 block text-sm font-medium" htmlFor="stock">Stock</label>
            <input id="stock" value={stock} onChange={(event) => setStock(event.target.value)} className="form-input" type="number" min="0" />

            {error ? <p className="mt-4 text-sm font-medium text-[#b42318]">{error}</p> : null}

            <button disabled={saving} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#151515] font-semibold text-white transition hover:bg-[#2f7d68] disabled:opacity-60">
              <span aria-hidden="true">+</span>
              {saving ? "Saving..." : "Add product"}
            </button>
          </form>

          <div className="rounded-lg border border-[#d8d0c2] bg-white p-5">
            <h2 className="text-xl font-semibold">Current stock</h2>
            <div className="mt-4 grid gap-3">
              {dashboard?.products.length ? (
                dashboard.products.map((product) => (
                  <div key={product.id} className="grid gap-3 rounded-lg border border-[#ebe4d8] p-4 sm:grid-cols-[1fr_120px_170px] sm:items-center">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="mt-1 text-sm text-[#65605a]">${Number(product.price).toFixed(2)} each</p>
                    </div>
                    <span className={Number(product.stock) <= 5 ? "status danger w-fit" : "status ok w-fit"}>
                      {Number(product.stock) <= 5 ? "Low stock" : "Ready"}
                    </span>
                    <div className="flex h-11 items-center rounded-md border border-[#d8d0c2]">
                      <button
                        type="button"
                        onClick={() => updateStock(product.id, Math.max(0, Number(product.stock) - 1))}
                        className="grid h-full w-11 place-items-center border-r border-[#d8d0c2] text-lg font-semibold"
                        aria-label={`Decrease ${product.name} stock`}
                      >
                        -
                      </button>
                      <input
                        value={product.stock}
                        onChange={(event) => updateStock(product.id, event.target.value)}
                        className="h-full min-w-0 flex-1 bg-transparent text-center font-semibold outline-none"
                        type="number"
                        min="0"
                        aria-label={`${product.name} stock`}
                      />
                      <button
                        type="button"
                        onClick={() => updateStock(product.id, Number(product.stock) + 1)}
                        className="grid h-full w-11 place-items-center border-l border-[#d8d0c2] text-lg font-semibold"
                        aria-label={`Increase ${product.name} stock`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-md bg-[#fffdf8] px-4 py-8 text-center text-[#65605a]">
                  Add your first product before the demo sale.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
