"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CatalogProduct = {
  id: string | number;
  sku: string;
  name: string;
  stock: number;
  minStock: number;
  price: number;
  supplier?: string;
  imageUrl?: string;
  available: boolean;
  statusLabel: string;
  preorderNote: string;
};

type CatalogResponse = {
  success: boolean;
  storage?: string;
  updatedAt?: string;
  stats?: {
    total: number;
    available: number;
    preorder: number;
    lowStock: number;
  };
  products?: CatalogProduct[];
  error?: string;
};

const filters = [
  { id: "all", label: "Alle Artikel" },
  { id: "available", label: "Sofort lieferbar" },
  { id: "preorder", label: "Vorbestellbar" },
];

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value || 0);
}

function badgeClasses(product: CatalogProduct) {
  if (!product.available) {
    return "border-rose-400/30 bg-rose-400/10 text-rose-100";
  }
  if (product.stock <= product.minStock) {
    return "border-amber-400/30 bg-amber-400/10 text-amber-100";
  }
  return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
}

function cardGradient(product: CatalogProduct) {
  if (!product.available) {
    return "from-rose-500/20 via-slate-900 to-slate-900";
  }
  if (product.stock <= product.minStock) {
    return "from-amber-500/20 via-slate-900 to-slate-900";
  }
  return "from-emerald-500/20 via-slate-900 to-slate-900";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ShopPage() {
  const [items, setItems] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [stats, setStats] = useState({ total: 0, available: 0, preorder: 0, lowStock: 0 });
  const [storage, setStorage] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      try {
        setLoading(true);
        const response = await fetch("/api/public-catalog", { cache: "no-store" });
        const data = (await response.json()) as CatalogResponse;
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Katalog konnte nicht geladen werden.");
        }
        if (!active) return;
        setItems(data.products || []);
        setStats(data.stats || { total: 0, available: 0, preorder: 0, lowStock: 0 });
        setStorage(data.storage || "unknown");
        setError("");
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : String(loadError));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCatalog();

    return () => {
      active = false;
    };
  }, []);

  const visibleItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    return items.filter((product) => {
      const matchesQuery =
        !search ||
        [product.name, product.sku, product.supplier || ""]
          .join(" ")
          .toLowerCase()
          .includes(search);

      const matchesFilter =
        filter === "all" ||
        (filter === "available" && product.available) ||
        (filter === "preorder" && !product.available);

      return matchesQuery && matchesFilter;
    });
  }, [filter, items, query]);

  async function copyPreorderNote(product: CatalogProduct) {
    const text = `${product.name} (${product.sku}) – ${product.preorderNote}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(product.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,.2),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#020617_100%)]">
      <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Öffentlicher Shop
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Lagerartikel mit Vorbestell-Hinweis bei Ausverkauf
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-medium text-white transition hover:bg-white/10"
            >
              Homepage
            </Link>
            <Link
              href="/mi-deals.html"
              className="rounded-full bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Warenwirtschaft
            </Link>
          </div>
        </nav>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/75 p-6 backdrop-blur-xl md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
              Shop / Lagerübersicht
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-6xl">
              Eure Produkte direkt im Shop sichtbar.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Verfügbare Artikel werden sofort angezeigt. Wenn ein Produkt nicht
              mehr auf Lager ist, erscheint es trotzdem mit einer klaren
              Vorbestellnotiz – so wissen Kunden direkt, was sofort geht und was
              nachkommt.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                {stats.available} sofort lieferbar
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                {stats.preorder} vorbestellbar
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                {stats.lowStock} kritisch niedrig
              </span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
              Prinzip
            </p>
            <div className="mt-4 space-y-4 text-slate-300">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="font-semibold text-white">Sofort lieferbar</div>
                <div className="mt-1 text-sm leading-6">
                  Artikel mit Bestand werden normal angezeigt und können direkt
                  verkauft werden.
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="font-semibold text-white">Vorbestellbar</div>
                <div className="mt-1 text-sm leading-6">
                  Ausverkaufte Artikel bleiben sichtbar und bekommen eine
                  Vorbestellnotiz statt still zu verschwinden.
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="font-semibold text-white">Intern getrennt</div>
                <div className="mt-1 text-sm leading-6">
                  Die Warenwirtschaft bleibt intern sauber, der Shop wirkt nach
                  außen professionell.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
                Katalog
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Lagerartikel durchsuchen
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Suche nach Name, Artikelnummer oder Lieferant. Ausverkaufte
                Artikel zeigen automatisch den Vorbestellstatus.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:min-w-[360px]">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Artikel suchen..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400"
              />
              <div className="flex flex-wrap gap-2">
                {filters.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      filter === item.id
                        ? "bg-cyan-400 text-slate-950"
                        : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Datenquelle: {storage || "wird geladen"}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Letztes Update: {stats.total ? "live" : "keine Daten"}
            </span>
          </div>

          {loading ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/70 p-8 text-slate-300">
              Katalog wird geladen...
            </div>
          ) : error ? (
            <div className="mt-8 rounded-3xl border border-rose-400/20 bg-rose-400/10 p-8 text-rose-100">
              {error}
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/70 p-8 text-slate-300">
              Keine passenden Artikel gefunden.
            </div>
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleItems.map((product) => (
                <article
                  key={product.id}
                  className={`overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br ${cardGradient(product)} p-5 shadow-xl shadow-slate-950/30`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        {product.sku}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white">
                        {product.name}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClasses(
                        product,
                      )}`}
                    >
                      {product.statusLabel}
                    </span>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-300">Preis</p>
                      <div className="mt-1 text-2xl font-semibold text-white">
                        {formatEuro(product.price)}
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-300">
                      <div>Bestand</div>
                      <div className="mt-1 text-lg font-semibold text-white">
                        {product.stock}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/8 bg-slate-950/60 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-semibold text-slate-100">
                        {initials(product.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-white">
                          {product.supplier || "Kein Lieferant hinterlegt"}
                        </div>
                        <div className="text-sm text-slate-400">
                          Mindestbestand: {product.minStock}
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {product.available
                        ? product.stock <= product.minStock
                          ? "Der Artikel ist noch verfügbar, aber bereits knapp."
                          : "Der Artikel ist sofort lieferbar."
                        : product.preorderNote}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {product.available ? "Direkt lieferbar" : "Vorbestellung"}
                    </span>
                    {!product.available ? (
                      <button
                        type="button"
                        onClick={() => copyPreorderNote(product)}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                      >
                        {copiedId === product.id ? "Notiz kopiert" : "Vorbestellnotiz kopieren"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="cursor-default rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300"
                      >
                        Sofort verfügbar
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
