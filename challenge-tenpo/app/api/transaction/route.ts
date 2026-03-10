import { NextResponse } from "next/server";
import { backendApi, backendServerHeaders } from "@/lib/api";

export async function GET() {
  const response = await backendApi.get("/transaction", {
    headers: backendServerHeaders,
  });

  return NextResponse.json(response.data, {
    status: response.status,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const incomingHeaders = request.headers;
  const headers: Record<string, string> = {
    ...backendServerHeaders,
    "Content-Type": "application/json",
  };
  const reqId = incomingHeaders.get("X-Request-ID");
  const idemKey = incomingHeaders.get("X-Idempotency-Key");
  if (reqId) headers["X-Request-ID"] = reqId;
  if (idemKey) headers["X-Idempotency-Key"] = idemKey;

  const response = await backendApi.post("/transaction", body, { headers });

  return NextResponse.json(response.data, {
    status: response.status,
  });
}

