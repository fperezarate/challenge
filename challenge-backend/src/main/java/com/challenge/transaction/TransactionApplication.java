package com.challenge.transaction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada de la aplicación Spring Boot.
 * <p>
 * Levanta la API REST de transacciones Tenpista sobre:
 * <ul>
 * <li>Spring Web (controladores REST bajo {@code /transaction})</li>
 * <li>Spring Data JPA + PostgreSQL para persistencia</li>
 * <li>Mecanismos de idempotencia, logging con UUID y bloqueo optimista</li>
 * </ul>
 */
@SpringBootApplication
public class TransactionApplication
{

	public static void main(String[] args)
	{
		SpringApplication.run(TransactionApplication.class, args);
	}
}
