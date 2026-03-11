'use client';

import { useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/app/types/transaction";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTransactions } from "@/hooks/useTransactions";
import { withErrorBoundary } from "./components/ErrorBoundary";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CL", {
    dateStyle: "short",
  });

function countByMerchant(transactions: Transaction[]): { comercio: string; cantidad: number }[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    const key = t.merchant.trim() || "(sin comercio)";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([comercio, cantidad]) => ({ comercio, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);
}

function Home() {
  const { data: transactions, isLoading, error, refetch } = useTransactions();
  const loadError = error
    ? "No pudimos cargar las transacciones. Revisa el backend."
    : null;

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const lastFive = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [transactions],
  );
  const chartData = useMemo(() => countByMerchant(transactions), [transactions]);

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 md:gap-10">
        <header className="flex flex-col gap-2 border-b border-border pb-6 md:pb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Inicio
          </h1>
          <p className="mt-2 text-base text-muted-foreground sm:mt-3 md:text-lg">
            Resumen de tu actividad y últimas transacciones.
          </p>
        </header>

        {loadError && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-4 text-destructive">
              {loadError}
            </CardContent>
          </Card>
        )}

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="text-lg">Total transacciones</CardTitle>
              <CardDescription>Número de movimientos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-12 w-24 animate-pulse rounded bg-muted" />
              ) : (
                <p className="text-3xl font-semibold text-foreground">
                  {transactions.length}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="text-lg">Monto total</CardTitle>
              <CardDescription>Suma de todos los montos</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-12 w-32 animate-pulse rounded bg-muted" />
              ) : (
                <p className="text-3xl font-semibold text-primary">
                  {formatCurrency(totalAmount)}
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-8">
          <Card className="min-w-0">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">Últimas transacciones</CardTitle>
                  <CardDescription className="mt-0.5 text-sm">
                    5 más recientes.
                  </CardDescription>
                </div>
                <Link
                  href="/transacciones"
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  Ver todas
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-44 animate-pulse rounded-lg bg-muted" />
              ) : lastFive.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No existen transacciones cargadas a la fecha.{" "}
                  <Link href="/transacciones" className="font-medium text-primary underline">
                    Crear
                  </Link>
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs">Comercio</TableHead>
                        <TableHead className="text-right text-xs">Monto</TableHead>
                        <TableHead className="text-xs">Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lastFive.map((t) => (
                        <TableRow key={t.id} className="text-sm">
                          <TableCell className="max-w-[120px] truncate font-medium">
                            {t.merchant}
                          </TableCell>
                          <TableCell className="text-right text-primary">
                            {formatCurrency(t.amount)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {formatDate(t.date)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Transacciones por giro o comercio</CardTitle>
              <CardDescription className="mt-0.5 text-sm">
                Top 10 por cantidad de movimientos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 animate-pulse rounded-lg bg-muted" />
              ) : chartData.length === 0 ? (
                <p className="flex h-64 items-center justify-center text-center text-sm text-muted-foreground">
                  No hay datos para mostrar. Crea transacciones en{" "}
                  <Link href="/transacciones" className="font-medium text-primary underline">
                    Transacciones
                  </Link>
                  .
                </p>
              ) : (
                <div className="chart-by-merchant h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickFormatter={(v) => String(Math.round(Number(v)))}
                        axisLine={{ stroke: "var(--border)" }}
                        tickLine={{ stroke: "var(--border)" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="comercio"
                        width={100}
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        axisLine={{ stroke: "var(--border)" }}
                        tickLine={false}
                        tickFormatter={(v) => (v.length > 14 ? `${v.slice(0, 12)}…` : v)}
                      />
                      <Tooltip
                        formatter={(value: number) => [value, "Transacciones"]}
                        labelFormatter={(label) => `Comercio: ${label}`}
                        contentStyle={{
                          fontSize: "12px",
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                        }}
                        labelStyle={{ color: "var(--foreground)" }}
                        wrapperStyle={{ outline: "none" }}
                      />
                      <Bar
                        dataKey="cantidad"
                        fill="var(--chart-1)"
                        radius={[0, 4, 4, 0]}
                        stroke="none"
                        activeBar={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

export default withErrorBoundary(Home, {
  title: "Ups, no pudimos cargar el panel",
  message:
    "Se produjo un error inesperado al mostrar el inicio. Puedes intentar nuevamente o recargar la página.",
  retryLabel: "Intentar de nuevo",
  displayName: "HomePage",
});

