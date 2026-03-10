import { NextResponse } from "next/server";
import { backendApi, backendServerHeaders } from "@/lib/api";

export async function GET() {
  try {
    const response = await backendApi.get("/recipient", {
      headers: backendServerHeaders,
    });
    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (err: unknown) {
    console.error("[GET /api/recipient] Error al llamar al backend:", err);
    const message = err instanceof Error ? err.message : "Error al llamar al backend";
    const status = err && typeof err === "object" && "response" in err
      ? (err as { response?: { status?: number } }).response?.status ?? 502
      : 502;
    return NextResponse.json(
      { error: message, details: "GET /api/recipient -> backend /recipient" },
      { status }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await backendApi.post("/recipient", body, {
      headers: backendServerHeaders,
    });
    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al llamar al backend";
    const status = err && typeof err === "object" && "response" in err
      ? (err as { response?: { status?: number } }).response?.status ?? 502
      : 502;
    return NextResponse.json(
      { error: message, details: "POST /api/recipient -> backend /recipient" },
      { status }
    );
  }
}
