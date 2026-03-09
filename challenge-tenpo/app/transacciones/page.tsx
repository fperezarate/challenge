'use client';

import { useEffect, useMemo, useState } from "react";
import { TransactionForm } from "@/app/components/TransactionForm";
import { TransactionsTable } from "@/app/components/TransactionsTable";
import type { Transaction, TransactionInput } from "@/app/types/transaction";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransactions } from "@/hooks/useTransactions";

const PAGE_SIZE = 5;

function exportToCsv(transactions: Transaction[]) {
  const headers = ["ID", "Monto", "Comercio", "Tenpista", "Fecha"];
  const rows = transactions.map((t) => [
    t.id,
    t.amount,
    `"${t.merchant.replace(/"/g, '""')}"`,
    `"${t.customerName.replace(/"/g, '""')}"`,
    t.date,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transacciones-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TransaccionesPage() {
  const {
    data: transactions,
    isLoading,
    error,
    refetch,
    createTransaction,
  } = useTransactions();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadError = error
    ? "No pudimos obtener las transacciones. Revisa el backend y vuelve a intentar."
    : null;

  const handleCreate = async (input: TransactionInput) => {
    await createTransaction(input);
  };

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.customerName.toLowerCase().includes(q) ||
          t.merchant.toLowerCase().includes(q),
      );
    }
    if (dateFrom) {
      const from = new Date(dateFrom).setHours(0, 0, 0, 0);
      list = list.filter((t) => new Date(t.date).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).setHours(23, 59, 59, 999);
      list = list.filter((t) => new Date(t.date).getTime() <= to);
    }
    return list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [transactions, searchQuery, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [filteredTransactions, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFrom, dateTo]);

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 md:gap-10">
        <header className="flex flex-col gap-2 border-b border-border pb-6 md:pb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Transacciones
          </h1>
          <p className="mt-2 text-base text-muted-foreground sm:mt-3 md:text-lg">
            Registra y visualiza el historial. Usa filtros y búsqueda para encontrar movimientos.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] xl:gap-10 lg:items-start">
          <Card className="min-w-0 shrink-0">
            <CardHeader className="space-y-2 px-4 py-5 sm:px-6 sm:py-6 md:px-6 md:py-6">
              <CardTitle className="text-xl md:text-2xl">Nueva transacción</CardTitle>
              <CardDescription className="text-base md:text-[1rem]">
                Completa los campos para registrar una transacción válida. El
                monto no puede ser negativo y la fecha no puede ser futura.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-6 sm:px-6 md:px-6 md:pb-8">
              <TransactionForm onCreate={handleCreate} />
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 px-4 py-5 sm:px-6 sm:py-6 md:px-6 md:py-6">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-xl md:text-2xl">Historial</CardTitle>
                <CardDescription className="mt-1 text-base md:text-[1rem]">
                  Filtra por fechas o busca por Tenpista/comercio. Exporta a CSV.
                </CardDescription>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refetch()}
                >
                  Recargar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCsv(filteredTransactions)}
                  disabled={filteredTransactions.length === 0}
                >
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-6 sm:px-6 md:px-6 md:pb-8">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm">Buscar</Label>
                  <Input
                    placeholder="Tenpista o comercio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm">Desde</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm">Hasta</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="h-44 animate-pulse rounded-lg bg-muted sm:h-48 md:h-52" />
              ) : loadError ? (
                <div className="flex flex-col gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-base text-destructive sm:px-5">
                  <p>{loadError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void refetch()}
                    className="w-fit border-destructive/50 text-destructive hover:bg-destructive/20"
                  >
                    Reintentar
                  </Button>
                </div>
              ) : (
                <>
                  <TransactionsTable transactions={paginatedTransactions} />
                  {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                      <p className="text-sm text-muted-foreground">
                        {filteredTransactions.length} resultado
                        {filteredTransactions.length !== 1 ? "s" : ""}
                        {" · "}
                        Página {currentPage} de {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage <= 1}
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage >= totalPages}
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
