import { NextResponse } from "next/server";
import { backendApi } from "@/lib/api";

export async function GET() {
  const response = await backendApi.get("/transaction");

  return NextResponse.json(response.data, {
    status: response.status,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  // Reenviar headers importantes al backend
  const incomingHeaders = request.headers;
  const headers = new Headers();

  const forwardHeader = (name: string) => {
    const value = incomingHeaders.get(name);
    if (value) headers.set(name, value);
  };

  forwardHeader("X-Request-ID");
  forwardHeader("X-Idempotency-Key");
  forwardHeader("User-Agent");
  forwardHeader("X-App-Version");
  headers.set("Content-Type", "application/json");

  const response = await backendApi.post("/transaction", body, {
    headers: Object.fromEntries(headers.entries()),
  });

  return NextResponse.json(response.data, {
    status: response.status,
  });
}

