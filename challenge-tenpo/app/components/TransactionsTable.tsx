import type { Transaction } from "@/app/types/transaction";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TransactionsTableProps = {
  transactions: Transaction[];
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 px-5 py-10 text-center text-base text-muted-foreground sm:py-12 md:px-6 md:py-14">
        Aún no hay transacciones registradas. Crea la primera usando el
        formulario.
      </div>
    );
  }

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="mt-4 max-h-[380px] overflow-auto rounded-lg border border-border sm:max-h-[420px] md:max-h-[480px]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-14 px-3 py-3 text-sm sm:px-4 sm:py-3.5 sm:text-base">ID</TableHead>
            <TableHead className="px-3 py-3 text-sm sm:px-4 sm:py-3.5 sm:text-base">Tenpista</TableHead>
            <TableHead className="px-3 py-3 text-sm sm:px-4 sm:py-3.5 sm:text-base">Comercio</TableHead>
            <TableHead className="px-3 py-3 text-right text-sm sm:px-4 sm:py-3.5 sm:text-base">Monto</TableHead>
            <TableHead className="px-3 py-3 text-sm sm:px-4 sm:py-3.5 sm:text-base">Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((tx, index) => (
            <TableRow
              key={tx.id ?? `${tx.customerName}-${tx.date}-${index}`}
            >
              <TableCell className="px-3 py-2.5 text-muted-foreground text-sm sm:px-4 sm:py-3 sm:text-base">{tx.id}</TableCell>
              <TableCell className="max-w-[120px] truncate px-3 py-2.5 text-sm sm:max-w-[160px] sm:px-4 sm:py-3 sm:text-base">
                {tx.customerName}
              </TableCell>
              <TableCell className="max-w-[120px] truncate px-3 py-2.5 text-sm sm:max-w-[180px] sm:px-4 sm:py-3 sm:text-base">
                {tx.merchant}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right font-medium text-primary text-sm sm:px-4 sm:py-3 sm:text-base">
                {formatCurrency(tx.amount)}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-muted-foreground text-xs sm:px-4 sm:py-3 sm:text-sm">
                {formatDateTime(tx.date)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
