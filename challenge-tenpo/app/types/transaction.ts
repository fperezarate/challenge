export type Transaction = {
  id: number;
  amount: number;
  merchant: string;
  customerName: string;
  date: string; // ISO datetime string
};

export type TransactionInput = Omit<Transaction, "id">;

