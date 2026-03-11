'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { RecipientInput } from "@/app/types/recipient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function normalizeRutDigits(value: string): string {
  return value.replace(/[^0-9kK]/g, "").toUpperCase();
}

function formatRut(value: string): string {
  const cleaned = normalizeRutDigits(value);
  if (cleaned.length < 2) return cleaned;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  const reversed = body.split("").reverse().join("");
  const chunks: string[] = [];
  for (let i = 0; i < reversed.length; i += 3) {
    chunks.push(reversed.slice(i, i + 3));
  }
  const withDots = chunks.join(".").split("").reverse().join("");

  return `${withDots}-${dv}`;
}

function isValidChileanRut(value: string): boolean {
  const cleaned = normalizeRutDigits(value);
  if (cleaned.length < 2) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  const dvExpected =
    remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);

  return dv === dvExpected;
}

const recipientFormSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres."),
  rut: z
    .string()
    .trim()
    .min(1, "El RUT es obligatorio.")
    .regex(
      /^[0-9kK]+$/,
      "El RUT solo puede contener números y K.",
    )
    .refine(isValidChileanRut, "El RUT no es válido (revisa dígito verificador)."),
  numeroCuenta: z
    .string()
    .trim()
    .min(1, "El número de cuenta es obligatorio."),
  email: z
    .string()
    .trim()
    .min(1, "El email es obligatorio.")
    .email("El email debe ser válido."),
});

type RecipientFormValues = z.infer<typeof recipientFormSchema>;

type RecipientFormProps = {
  onCreate: (input: RecipientInput) => Promise<void> | void;
  onSuccess?: () => void;
};

export function RecipientForm({ onCreate, onSuccess }: RecipientFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RecipientFormValues>({
    resolver: zodResolver(recipientFormSchema),
    defaultValues: {
      nombre: "",
      rut: "",
      numeroCuenta: "",
      email: "",
    },
  });

  const onSubmit = async (data: RecipientFormValues) => {
    setSubmitError(null);
    setIsBusy(true);

    const input: RecipientInput = {
      nombre: data.nombre.trim(),
      rut: formatRut(data.rut),
      numeroCuenta: data.numeroCuenta.trim(),
      email: data.email.trim(),
    };

    try {
      await onCreate(input);
      reset();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      const maybeAxiosError = error as { response?: { status?: number } };
      if (maybeAxiosError.response?.status === 409) {
        setSubmitError("Ya existe un destinatario con este RUT y número de cuenta.");
      } else {
        setSubmitError(
          "Ocurrió un error al crear el destinatario. Inténtalo nuevamente."
        );
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 text-base"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="recipient-nombre">Nombre</Label>
        <Input
          id="recipient-nombre"
          type="text"
          className={cn(errors.nombre && "border-destructive")}
          aria-invalid={Boolean(errors.nombre)}
          {...register("nombre")}
        />
        {errors.nombre && (
          <p className="text-sm text-destructive">{errors.nombre.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="recipient-rut">RUT</Label>
        <Input
          id="recipient-rut"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={cn(errors.rut && "border-destructive")}
          aria-invalid={Boolean(errors.rut)}
          {...register("rut", {
            onChange: (event) => {
              const value = event.target.value as string;
              event.target.value = normalizeRutDigits(value);
            },
          })}
        />
        {errors.rut && (
          <p className="text-sm text-destructive">{errors.rut.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="recipient-numeroCuenta">Número de cuenta</Label>
        <Input
          id="recipient-numeroCuenta"
          type="text"
          className={cn(errors.numeroCuenta && "border-destructive")}
          aria-invalid={Boolean(errors.numeroCuenta)}
          {...register("numeroCuenta")}
        />
        {errors.numeroCuenta && (
          <p className="text-sm text-destructive">
            {errors.numeroCuenta.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Tipo de cuenta</Label>
        <div className="flex h-10 items-center rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
          Tenpo
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="recipient-email">Email</Label>
        <Input
          id="recipient-email"
          type="email"
          className={cn(errors.email && "border-destructive")}
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {submitError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || isBusy}
          size="lg"
          className="min-h-10 px-6 text-base"
        >
          {isSubmitting || isBusy ? "Creando..." : "Crear destinatario"}
        </Button>
      </div>
    </form>
  );
}
