import { del, list, put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DB_KEY = "mi-deals/database.json";

function authorized(request: Request) {
  const configuredPassword = process.env.MI_DEALS_PASSWORD || "MI-Deals-2026!";
  return request.headers.get("x-mi-deals-password") === configuredPassword;
}

const initialData = {
  version: 3,
  updatedAt: new Date().toISOString(),
  customers: [
    { id: 1, name: "M&I Deal Testkunde", contact: "Miguel", phone: "", notes: "Startkunde" },
    { id: 2, name: "Nordsee Musterkunde", contact: "Ingo", phone: "", notes: "Beispiel" },
  ],
  products: [
    { id: 1, sku: "ART-001", name: "Stifte", stock: 50, minStock: 15, price: 1.2, supplier: "ABC Supplier" },
    { id: 2, sku: "ART-002", name: "Notizhefter", stock: 20, minStock: 8, price: 5.0, supplier: "XYZ GmbH" },
    { id: 3, sku: "ART-003", name: "Tafel", stock: 10, minStock: 5, price: 2.5, supplier: "XYZ GmbH" },
  ],
  deliveries: [
    {
      id: 1,
      number: "LIEF-2026-001",
      customer: "M&I Deal Testkunde",
      status: "offen",
      createdAt: new Date().toLocaleDateString("de-DE"),
      lines: [
        { id: 1, sku: "ART-001", name: "Stifte", expected: 20, received: 0 },
        { id: 2, sku: "ART-002", name: "Notizhefter", expected: 5, received: 0 },
      ],
    },
  ],
};

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readDatabase() {
  if (!hasBlobToken()) {
    return { ok: false, reason: "BLOB_READ_WRITE_TOKEN fehlt", data: initialData };
  }

  const existing = await list({ prefix: DB_KEY, limit: 1 });
  const blob = existing.blobs.find((entry) => entry.pathname === DB_KEY);

  if (!blob) {
    await put(DB_KEY, JSON.stringify(initialData, null, 2), {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
    });
    return { ok: true, reason: "initialisiert", data: initialData };
  }

  const response = await fetch(`${blob.url}?t=${Date.now()}`, { cache: "no-store" });
  const data = await response.json();
  return { ok: true, reason: "geladen", data };
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ success: false, error: "Nicht autorisiert" }, { status: 401 });
  }
  try {
    const result = await readDatabase();
    return NextResponse.json({
      success: result.ok,
      storage: result.ok ? "vercel_blob" : "not_connected",
      reason: result.reason,
      data: result.data,
    });
  } catch (error) {
    return NextResponse.json({ success: false, storage: "error", error: String(error), data: initialData }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ success: false, error: "Nicht autorisiert" }, { status: 401 });
  }
  try {
    if (!hasBlobToken()) {
      return NextResponse.json({ success: false, storage: "not_connected", error: "BLOB_READ_WRITE_TOKEN fehlt" }, { status: 503 });
    }

    const body = await request.json();
    const data = {
      version: 3,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await put(DB_KEY, JSON.stringify(data, null, 2), {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
    });

    return NextResponse.json({ success: true, storage: "vercel_blob", data });
  } catch (error) {
    return NextResponse.json({ success: false, storage: "error", error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ success: false, error: "Nicht autorisiert" }, { status: 401 });
  }
  try {
    if (!hasBlobToken()) {
      return NextResponse.json({ success: false, storage: "not_connected", error: "BLOB_READ_WRITE_TOKEN fehlt" }, { status: 503 });
    }
    await del(DB_KEY);
    return NextResponse.json({ success: true, storage: "vercel_blob", reset: true });
  } catch (error) {
    return NextResponse.json({ success: false, storage: "error", error: String(error) }, { status: 500 });
  }
}
