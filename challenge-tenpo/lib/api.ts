import axios from "axios";
import type { Transaction, TransactionInput } from "@/app/types/transaction";

/** Formato de respuesta del backend (transaction-api) */
type BackendTransaction = {
  id: number;
  monto: number;
  giroComercio: string;
  nombreTenpista: string;
  fechaTransaccion: string;
};

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";

function createAxiosClient(baseURL: string) {
  const instance = axios.create({
    baseURL,
    timeout: 10_000,
  });

  instance.interceptors.request.use((config) => {
    if (typeof config.headers === "undefined") {
      config.headers = {} as typeof config.headers;
    }
    if (!config.headers["X-Request-ID"]) {
      config.headers["X-Request-ID"] = crypto.randomUUID();
    }
    const isMutation = ["post", "put", "patch"].includes(
      (config.method ?? "").toLowerCase()
    );
    if (isMutation && !config.headers["X-Idempotency-Key"]) {
      config.headers["X-Idempotency-Key"] = crypto.randomUUID();
    }
    config.headers["User-Agent"] = `TenpoApp/${APP_VERSION}`;
    config.headers["X-App-Version"] = APP_VERSION;
    return config;
  });

  return instance;
}

// Cliente para el frontend → API de Next
export const api = createAxiosClient("/api");

// Cliente para Next (route handlers) → backend Java
export const backendApi = createAxiosClient(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081"
);

function fromBackend(raw: BackendTransaction): Transaction {
  return {
    id: raw.id,
    amount: raw.monto,
    merchant: raw.giroComercio,
    customerName: raw.nombreTenpista,
    date: raw.fechaTransaccion,
  };
}

function toBackendBody(input: TransactionInput): Record<string, unknown> {
  return {
    monto: input.amount,
    giroComercio: input.merchant,
    nombreTenpista: input.customerName,
    fechaTransaccion: input.date,
  };
}

export const getTransactions = async (): Promise<Transaction[]> => {
  const { data } = await api.get<BackendTransaction[]>("/transaction");
  return data.map(fromBackend);
};

export const createTransaction = async (
  input: TransactionInput,
  idempotencyKey: string
): Promise<Transaction> => {
  const { data } = await api.post<BackendTransaction>(
    "/transaction",
    toBackendBody(input),
    {
      headers: {
        "X-Idempotency-Key": idempotencyKey,
      },
    }
  );
  return fromBackend(data);
};

