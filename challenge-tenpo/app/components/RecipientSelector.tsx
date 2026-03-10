'use client';

import { useState } from "react";
import type { Recipient } from "@/app/types/recipient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecipientForm } from "@/app/components/RecipientForm";
import { ChevronDownIcon, UserPlusIcon } from "lucide-react";

type RecipientSelectorProps = {
  recipients: Recipient[];
  selectedRecipient: Recipient | null;
  onSelect: (recipient: Recipient | null) => void;
  onCreateRecipient: (input: {
    nombre: string;
    rut: string;
    numeroCuenta: string;
    email: string;
  }) => Promise<Recipient>;
  isLoading?: boolean;
};

export function RecipientSelector({
  recipients,
  selectedRecipient,
  onSelect,
  onCreateRecipient,
  isLoading,
}: RecipientSelectorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreate = async (input: {
    nombre: string;
    rut: string;
    numeroCuenta: string;
    email: string;
  }) => {
    const created = await onCreateRecipient(input);
    setDialogOpen(false);
    onSelect(created);
  };

  const sectionContent = isLoading ? (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">Cargando destinatarios...</p>
      <div className="h-12 w-full animate-pulse rounded-lg bg-muted" aria-hidden />
    </div>
  ) : recipients.length === 0 ? (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        No tienes destinatarios. Crea uno para realizar una transacción.
      </p>
      <Button
        type="button"
        variant="default"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="w-full sm:w-auto"
      >
        <UserPlusIcon className="mr-1.5 size-4" />
        Crear destinatario
      </Button>
    </div>
  ) : (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="relative w-full sm:flex-1">
        <select
          value={selectedRecipient?.id ?? ""}
          onChange={(e) => {
            const id = e.target.value;
            if (!id) {
              onSelect(null);
              return;
            }
            const r = recipients.find((rec) => rec.id === Number(id));
            if (r) onSelect(r);
          }}
          className="block h-10 w-full min-w-[220px] appearance-none rounded-md border border-input bg-background px-3 pr-9 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Seleccionar destinatario"
        >
          <option value="">Selecciona un destinatario</option>
          {recipients.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre} {r.numeroCuenta ? `(${r.numeroCuenta})` : ""}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
          <ChevronDownIcon className="size-4" />
        </span>
      </div>
      <div className="w-full sm:w-auto sm:flex-none sm:justify-end flex">
        <Button
          type="button"
          variant="default"
          size="default"
          onClick={() => setDialogOpen(true)}
          className="h-10 w-full sm:w-auto px-4"
        >
          <UserPlusIcon className="mr-1.5 size-4" />
          Crear destinatario
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <section
        className="rounded-lg border border-border bg-muted/30 px-4 py-4"
        aria-labelledby="destinatario-heading"
      >
        <h2 id="destinatario-heading" className="mb-3 text-sm font-medium text-foreground">
          Destinatario
        </h2>
        {sectionContent}
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Nuevo destinatario</DialogTitle>
          </DialogHeader>
          <RecipientForm onCreate={handleCreate} onSuccess={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
