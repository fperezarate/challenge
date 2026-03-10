package com.challenge.transaction.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateRecipientRequest(
		@NotBlank(message = "El nombre es obligatorio")
		@Size(max = 255)
		String nombre,

		@NotBlank(message = "El RUT es obligatorio")
		@Size(max = 20)
		String rut,

		@NotBlank(message = "El número de cuenta es obligatorio")
		@Size(max = 50)
		String numeroCuenta,

		@NotBlank(message = "El email es obligatorio")
		@Email(message = "El email debe ser válido")
		@Size(max = 255)
		String email
) {
}
