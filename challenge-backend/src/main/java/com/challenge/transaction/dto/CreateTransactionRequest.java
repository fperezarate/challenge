package com.challenge.transaction.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CreateTransactionRequest(@NotNull(message = "El monto es obligatorio") @PositiveOrZero(message = "El monto no puede ser negativo") Integer monto,

		@NotBlank(message = "El giro o comercio es obligatorio") @Size(max = 255) String giroComercio,

		@NotBlank(message = "El nombre del Tenpista es obligatorio") @Size(max = 255) String nombreTenpista,

		@NotNull(message = "La fecha de transacción es obligatoria") @PastOrPresent(message = "La fecha de transacción no puede ser superior a la fecha y hora actual") LocalDateTime fechaTransaccion) {
}
