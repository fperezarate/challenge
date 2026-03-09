package com.challenge.transaction.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


/**
 * Configuración de OpenAPI para la API REST de transacciones.
 * <p>
 * Define el esquema de la API y sus endpoints.
 * @author Felipe Pérez
 * @version 1.0
 * @since 2026-03-09
 */

@Configuration
public class OpenApiConfig
{

	@Bean
	public OpenAPI customOpenAPI()
	{
		return new OpenAPI().info(new Info().title("Transaction API")
				.description("API REST para gestión de transacciones Tenpista. Permite listar y crear transacciones con validación de monto y fecha.")
				.version("1.0"));
	}
}
