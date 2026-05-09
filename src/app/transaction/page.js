"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { businessApi } from "@/lib/businessStore";
import { useBusinessData } from "@/lib/useBusinessData";

export default function AddTransactionPage() {
  const router = useRouter();
  const { user, dashboard, loading } = useBusinessData();
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedProduct = useMemo(
    () =>
      dashboard?.products.find(
        (product) => product.name.toLowerCase() === productName.trim().toLowerCase(),
      ),
    [dashboard?.products, productName],
  );

  const total = Number(quantity || 0) * Number(price || 0);

  const chooseProduct = (name) => {
    const product = dashboard.products.find((item) => item.name === name);
    setProductName(name);
    setPrice(product?.price || "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!user) {
      setError("Login with a business name first.");
      return;
    }

    if (!productName.trim() || Number(quantity) <= 0 || Number(price) < 0) {
      setError("Enter product name, quantity, and price.");
      return;
    }

    try {
      setSubmitting(true);
      await businessApi.addTransaction(user.id, { productName, quantity, price });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Could not save transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f4ee]">Loading sale form...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 text-[#151515] md:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-col gap-3 border-b border-[#d8d0c2] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#ad4d3b]">Add transaction</p>
            <h1 className="mt-2 text-3xl font-semibold">Record a sale</h1>
          </div>
          <Link href="/dashboard" className="nav-button secondary">Dashboard</Link>
        </header>

        <section className="mt-6 grid gap-5 md:grid-cols-[1fr_280px]">
          <form onSubmit={handleSubmit} className="rounded-lg border border-[#d8d0c2] bg-white p-5">
            <label className="block text-sm font-medium" htmlFor="product-name">Product name</label>
            <input
              id="product-name"
              list="products"
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
              className="form-input"
              placeholder="Coffee"
            />
            <datalist id="products">
              {dashboard?.products.map((product) => (
                <option key={product.id} value={product.name} />
              ))}
            </datalist>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium" htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium" htmlFor="price">Unit price</label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className="form-input"
                  placeholder="2.50"
                />
              </div>
            </div>

            {selectedProduct ? (
              <p className="mt-4 rounded-md bg-[#eef8f4] px-3 py-2 text-sm text-[#245f50]">
                Current stock: {selectedProduct.stock}. This sale will update inventory automatically.
              </p>
            ) : null}

            {error ? <p className="mt-4 text-sm font-medium text-[#b42318]">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#151515] font-semibold text-white transition hover:bg-[#2f7d68] disabled:opacity-60"
            >
              <span aria-hidden="true">✓</span>
              {submitting ? "Saving..." : "Save transaction"}
            </button>
          </form>

          <aside className="rounded-lg border border-[#d8d0c2] bg-white p-5">
            <h2 className="text-lg font-semibold">Sale preview</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#65605a]">Product</dt>
                <dd className="font-semibold">{productName || "Not selected"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#65605a]">Quantity</dt>
                <dd className="font-semibold">{quantity || 0}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-[#ebe4d8] pt-3">
                <dt className="text-[#65605a]">Total</dt>
                <dd className="text-xl font-semibold">${total.toFixed(2)}</dd>
              </div>
            </dl>
            <div className="mt-6 space-y-2">
              {dashboard?.products.slice(0, 4).map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => chooseProduct(product.name)}
                  className="flex w-full items-center justify-between rounded-md border border-[#ebe4d8] px-3 py-2 text-left text-sm transition hover:border-[#2f7d68]"
                >
                  <span className="font-semibold">{product.name}</span>
                  <span className="text-[#65605a]">${Number(product.price).toFixed(2)}</span>
                </button>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
