'use client';

import jsPDF from "jspdf";
import type { Transaction } from "@/app/types/transaction";

export function generateTransactionReceiptPdf(transaction: Transaction) {
  const doc = new jsPDF();

  const marginLeft = 20;
  let currentY = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Comprobante de transacción", marginLeft, currentY);

  currentY += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Tenpo — Transacciones", marginLeft, currentY);

  currentY += 12;

  const date = new Date(transaction.date);
  const friendlyDate = date.toLocaleString("es-CL");
  const reference = `TENP-${transaction.id}-${date
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}`;

  const lineGap = 8;

  const addField = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, marginLeft, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(value, marginLeft + 45, currentY);
    currentY += lineGap;
  };

  addField("Monto:", `$${transaction.amount.toLocaleString("es-CL")}`);
  addField("Comercio:", transaction.merchant);
  addField("Tenpista:", transaction.customerName);
  addField("Fecha y hora:", friendlyDate);
  addField("ID de transacción:", String(transaction.id));
  addField("Referencia:", reference);

  currentY += 6;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    "Guarda este comprobante para tus registros.",
    marginLeft,
    currentY
  );

  doc.save(`comprobante-transaccion-${transaction.id}.pdf`);
}

