'use client';

import Image from "next/image";
import type { Transaction } from "@/app/types/transaction";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateTransactionReceiptPdf } from "@/lib/receiptPdf";

type TransactionReceiptModalProps = {
  transaction: Transaction;
  open: boolean;
  onClose: () => void;
};

export function TransactionReceiptModal({
  transaction,
  open,
  onClose,
}: TransactionReceiptModalProps) {
  const date = new Date(transaction.date);
  const friendlyDate = date.toLocaleString("es-CL");
  const reference = `TENP-${transaction.id}-${date
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}`;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary/10">
              <Image
                src="/logo.png"
                alt="Tenpo"
                fill
                className="object-contain p-1.5"
              />
            </div>
            <div className="flex flex-col">
              <DialogTitle className="text-base font-semibold">
                Comprobante de transacción
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                ¡Listo! Estos son los datos de tu transacción.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-3 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Monto</span>
            <span className="font-semibold">
              ${transaction.amount.toLocaleString("es-CL")}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Comercio</span>
            <span className="max-w-[55%] truncate font-medium">
              {transaction.merchant}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Tenpista</span>
            <span className="max-w-[55%] truncate">
              {transaction.customerName}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Fecha y hora</span>
            <span className="max-w-[55%] truncate">{friendlyDate}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">ID de transacción</span>
            <span className="max-w-[55%] truncate text-xs font-mono">
              {transaction.id}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Referencia</span>
            <span className="max-w-[55%] truncate text-xs font-mono">
              {reference}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            type="button"
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Cerrar
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => generateTransactionReceiptPdf(transaction)}
          >
            Descargar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

