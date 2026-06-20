import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function POST(request: NextRequest) {
  if (!API_BASE) {
    return NextResponse.json({ success: false, error: "NEXT_PUBLIC_API_URL nicht gesetzt" }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const res = await fetch(`${API_BASE}/api/vision`, {
      method: "POST",
      headers: {
        "x-mi-deals-password": request.headers.get("x-mi-deals-password") || "",
      },
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}