"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { businessApi, getActiveUser, hasSupabase } from "@/lib/businessStore";

export default function LoginPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getActiveUser()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!businessName.trim()) {
      setError("Enter a business name to continue.");
      return;
    }

    try {
      setSubmitting(true);
      await businessApi.login({ businessName, businessType });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Could not enter the business workspace.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#151515]">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-8 md:grid-cols-[1fr_440px] md:px-8">
        <div className="space-y-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f7d68]">
              Smart Local Business Intelligence
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight text-[#151515] md:text-7xl">
              Daily sales, stock, and insights for small businesses.
            </h1>
          </div>
          <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
            {["Record sales", "Track stock", "See profit"].map((item) => (
              <div key={item} className="rounded-lg border border-[#d8d0c2] bg-white px-4 py-4 shadow-sm">
                <span className="text-sm font-semibold text-[#ad4d3b]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-[#d8d0c2] bg-white p-6 shadow-xl shadow-black/5"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Enter your shop</h2>
            <p className="mt-2 text-sm text-[#65605a]">
              Use a business name for the demo. {hasSupabase ? "Supabase is connected." : "Demo mode uses this browser."}
            </p>
          </div>

          <label className="block text-sm font-medium text-[#34302c]" htmlFor="business-name">
            Business name
          </label>
          <input
            id="business-name"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            className="mt-2 h-12 w-full rounded-md border border-[#cfc6b7] bg-[#fffdf8] px-4 outline-none transition focus:border-[#2f7d68] focus:ring-4 focus:ring-[#2f7d68]/15"
            placeholder="ABC Shop"
          />

          <label className="mt-5 block text-sm font-medium text-[#34302c]" htmlFor="business-type">
            Business type
          </label>
          <input
            id="business-type"
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value)}
            className="mt-2 h-12 w-full rounded-md border border-[#cfc6b7] bg-[#fffdf8] px-4 outline-none transition focus:border-[#2f7d68] focus:ring-4 focus:ring-[#2f7d68]/15"
            placeholder="Cafe, kiosk, bar, vendor"
          />

          {error ? <p className="mt-4 text-sm font-medium text-[#b42318]">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#151515] px-5 font-semibold text-white transition hover:bg-[#2f7d68] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span aria-hidden="true">→</span>
            {submitting ? "Entering..." : "Enter"}
          </button>

          <Link
            href="/dashboard"
            className="mt-4 flex h-11 w-full items-center justify-center rounded-md border border-[#d8d0c2] text-sm font-semibold text-[#34302c] transition hover:border-[#2f7d68] hover:text-[#2f7d68]"
          >
            View demo dashboard
          </Link>
        </form>
      </section>
    </main>
  );
}
