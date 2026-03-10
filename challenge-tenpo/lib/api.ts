import axios from "axios";
import type { Transaction, TransactionInput } from "@/app/types/transaction";
import type { Recipient, RecipientInput } from "@/app/types/recipient";

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
    if (typeof window !== "undefined") {
      delete config.headers["User-Agent"];
      delete config.headers["user-agent"];
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
    return config;
  });

  return instance;
}

// Cliente para el frontend → API de Next (navegador: no setear User-Agent, está prohibido)
export const api = createAxiosClient("/api");

// URL del backend Java (solo usada en route handlers del servidor)
const backendBaseURL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL?.trim()) ||
  "http://localhost:8081";

// Cliente para Next (route handlers) → backend Java
export const backendApi = createAxiosClient(backendBaseURL);

export const backendServerHeaders = {
  "User-Agent": `TenpoApp/${process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0"}`,
  "X-App-Version": process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",
};

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

// --- Recipients (destinatarios) ---

export const getRecipients = async (): Promise<Recipient[]> => {
  const { data } = await api.get<Recipient[]>("/recipient");
  return data;
};

export const createRecipient = async (
  input: RecipientInput
): Promise<Recipient> => {
  const { data } = await api.post<Recipient>("/recipient", input);
  return data;
};

