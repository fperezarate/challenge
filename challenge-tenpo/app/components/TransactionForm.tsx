'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { TransactionInput } from "@/app/types/transaction";
import { Button } from "@/components/ui/button";
import { BanknoteIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const getNowLocalISOString = () => {
  const now = new Date();
  const tzOffsetMinutes = now.getTimezoneOffset();
  const local = new Date(now.getTime() - tzOffsetMinutes * 60_000);
  return local.toISOString().slice(0, 16);
};

const transactionFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Ingresa un monto válido.")
    .refine(
      (v) => !Number.isNaN(Number(v)) && Number(v) > 0,
      "El monto debe ser mayor a 0."
    ),
  merchant: z
    .string()
    .trim()
    .min(2, "Ingresa el comercio o giro (mínimo 2 caracteres)."),
  customerName: z
    .string()
    .trim()
    .min(2, "Ingresa el nombre del Tenpista (mínimo 2 caracteres)."),
  date: z
    .string()
    .min(1, "Selecciona una fecha y hora.")
    .refine(
      (d) => new Date(d).getTime() <= new Date().getTime(),
      "La fecha no puede ser futura."
    ),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

type TransactionFormProps = {
  onCreate: (input: TransactionInput) => Promise<void> | void;
  /** Nombre del Tenpista pre-rellenado al seleccionar un destinatario */
  defaultCustomerName?: string;
};

export function TransactionForm({ onCreate, defaultCustomerName = "" }: TransactionFormProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: "",
      merchant: "",
      customerName: defaultCustomerName,
      date: getNowLocalISOString(),
    },
  });

  useEffect(() => {
    setValue("customerName", defaultCustomerName);
  }, [defaultCustomerName, setValue]);

  const onSubmit = async (data: TransactionFormValues) => {
    setSuccessMessage(null);
    setSubmitError(null);
    setIsBusy(true);

    const dateForApi =
      data.date.length <= 16 ? `${data.date}:00` : data.date.slice(0, 19);
    const input: TransactionInput = {
      amount: Number(data.amount),
      merchant: data.merchant.trim(),
      customerName: data.customerName.trim(),
      date: dateForApi,
    };

    try {
      await onCreate(input);
      setSuccessMessage("Transacción creada correctamente.");
      reset({
        amount: "",
        merchant: "",
        customerName: defaultCustomerName,
        date: getNowLocalISOString(),
      });
    } catch (error) {
      console.error(error);
      setSubmitError(
        "Ocurrió un error al crear la transacción. Inténtalo nuevamente."
      );
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-2 flex flex-col gap-5 text-base sm:mt-4 md:gap-6"
      noValidate
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount" className="text-[0.95rem] sm:text-base">
            Monto en pesos
          </Label>
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            min={1}
            step={1}
            className={cn(
              "h-10 text-base sm:h-11",
              errors.amount && "border-destructive"
            )}
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? "amount-error" : undefined}
            {...register("amount")}
          />
          {errors.amount && (
            <p id="amount-error" className="text-sm text-destructive">
              {errors.amount.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="merchant" className="text-[0.95rem] sm:text-base">
            Giro o comercio
          </Label>
          <Input
            id="merchant"
            type="text"
            className={cn(
              "h-10 text-base sm:h-11",
              errors.merchant && "border-destructive"
            )}
            aria-invalid={Boolean(errors.merchant)}
            aria-describedby={errors.merchant ? "merchant-error" : undefined}
            {...register("merchant")}
          />
          {errors.merchant && (
            <p id="merchant-error" className="text-sm text-destructive">
              {errors.merchant.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="customerName" className="text-[0.95rem] sm:text-base">
            Nombre del Tenpista
          </Label>
          <Input
            id="customerName"
            type="text"
            className={cn(
              "h-10 text-base sm:h-11",
              errors.customerName && "border-destructive"
            )}
            aria-invalid={Boolean(errors.customerName)}
            aria-describedby={
              errors.customerName ? "customerName-error" : undefined
            }
            {...register("customerName")}
          />
          {errors.customerName && (
            <p id="customerName-error" className="text-sm text-destructive">
              {errors.customerName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="date" className="text-[0.95rem] sm:text-base">
            Fecha de transacción
          </Label>
          <Input
            id="date"
            type="datetime-local"
            max={getNowLocalISOString()}
            className={cn(
              "h-10 text-base sm:h-11",
              errors.date && "border-destructive"
            )}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? "date-error" : undefined}
            {...register("date")}
          />
          {errors.date && (
            <p id="date-error" className="text-sm text-destructive">
              {errors.date.message}
            </p>
          )}
        </div>
      </div>

      {submitError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {successMessage}
        </div>
      )}

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={isSubmitting || isBusy}
          size="lg"
          className="min-h-10 px-6 text-base inline-flex items-center justify-start gap-1.5"
        >
          <BanknoteIcon className="h-4 w-4" />
          {isSubmitting || isBusy ? "Creando..." : "Crear transacción"}
        </Button>
      </div>
    </form>
  );
}
