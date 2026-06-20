import { list, put } from "@vercel/blob";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CatalogProduct = {
  id: string | number;
  sku: string;
  name: string;
  stock: number;
  minStock: number;
  price: number;
  supplier?: string;
  imageUrl?: string;
};

type AppState = {
  version: number;
  updatedAt?: string;
  customers: unknown[];
  products: CatalogProduct[];
  deliveries: unknown[];
  sales?: unknown[];
};

const DEFAULT_STATE: AppState = {
  version: 3,
  updatedAt: new Date().toISOString(),
  customers: [
    { id: 1, name: "M&I Deal Testkunde", contact: "Miguel", phone: "", notes: "Startkunde" },
    { id: 2, name: "Nordsee Musterkunde", contact: "Ingo", phone: "", notes: "Beispiel" },
  ],
  products: [
    { id: 1, sku: "ART-001", name: "Stifte", stock: 50, minStock: 15, price: 1.2, supplier: "ABC Supplier" },
    { id: 2, sku: "ART-002", name: "Notizhefter", stock: 20, minStock: 8, price: 5, supplier: "XYZ GmbH" },
    { id: 3, sku: "ART-003", name: "Tafel", stock: 0, minStock: 5, price: 2.5, supplier: "XYZ GmbH" },
  ],
  deliveries: [],
  sales: [],
};

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function localFilePath() {
  return path.join(process.cwd(), ".mi-deals-state.json");
}

function normalizeProduct(raw: CatalogProduct): CatalogProduct & {
  available: boolean;
  statusLabel: string;
  preorderNote: string;
} {
  const stock = Number(raw.stock || 0);
  const minStock = Number(raw.minStock || 0);
  const available = stock > 0;
  const statusLabel = available ? (stock <= minStock ? "Wenig Bestand" : "Sofort lieferbar") : "Vorbestellbar";
  return {
    ...raw,
    stock,
    minStock,
    price: Number(raw.price || 0),
    available,
    statusLabel,
    preorderNote: available
      ? "Sofort lieferbar"
      : `Vorbestellung möglich: ${raw.name} ist aktuell ausverkauft und wird nach Eingang der nächsten Lieferung reserviert.`,
  };
}

async function readState(): Promise<{ state: AppState; storage: string }> {
  if (hasBlobToken()) {
    const existing = await list({ prefix: "mi-deals/database.json", limit: 1 });
    const blob = existing.blobs.find((entry) => entry.pathname === "mi-deals/database.json");

    if (!blob) {
      await put("mi-deals/database.json", JSON.stringify(DEFAULT_STATE, null, 2), {
        access: "public",
        contentType: "application/json",
        allowOverwrite: true,
      });
      return { state: DEFAULT_STATE, storage: "vercel_blob_initial" };
    }

    const response = await fetch(`${blob.url}?t=${Date.now()}`, { cache: "no-store" });
    const data = await response.json();
    return { state: data as AppState, storage: "vercel_blob" };
  }

  try {
    const file = await localFilePath();
    const text = await fs.readFile(file, "utf8");
    return { state: JSON.parse(text) as AppState, storage: "local_file" };
  } catch {
    return { state: DEFAULT_STATE, storage: "default" };
  }
}

export async function GET() {
  try {
    const { state, storage } = await readState();
    const products = Array.isArray(state.products) ? state.products.map(normalizeProduct) : [];
    const available = products.filter((product) => product.available);
    const preorder = products.filter((product) => !product.available);
    const lowStock = products.filter((product) => product.available && product.stock <= product.minStock);

    return NextResponse.json({
      success: true,
      storage,
      updatedAt: state.updatedAt ?? new Date().toISOString(),
      stats: {
        total: products.length,
        available: available.length,
        preorder: preorder.length,
        lowStock: lowStock.length,
      },
      products: products.sort((a, b) => Number(b.available) - Number(a.available) || a.name.localeCompare(b.name, "de")),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
