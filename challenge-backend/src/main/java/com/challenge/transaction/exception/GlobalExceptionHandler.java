package com.challenge.transaction.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.persistence.OptimisticLockException;
import jakarta.validation.ConstraintViolationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Manejador global de excepciones para el backend.
 * <p>
 * Captura y transforma las excepciones de validación, violación de restricciones
 * y errores no controlados en respuestas HTTP estandarizadas.
 * <ul>
 *   <li>Transforma {@link MethodArgumentNotValidException} en respuestas 400
 *   con detalles de error en el cuerpo.</li>
 *   <li>Transforma {@link ConstraintViolationException} en respuestas 400 con
 *   detalles de error en el cuerpo.</li>
 *   <li>Transforma {@link OptimisticLockException} en respuestas 409 con mensajes
 *   de conflicto.</li>
 *   <li>Transforma todas las excepciones no controladas en respuestas 500 con
 *   mensajes genéricos.</li>
 * </ul>
 * Los logs incluyen el {@code X-Request-ID} para rastrear eventos entre
 * diferentes instancias del backend.
 */
@RestControllerAdvice
public class GlobalExceptionHandler
{

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex)
	{
		List<Map<String, String>> errors = ex.getBindingResult().getFieldErrors().stream().map(err -> Map.<String, String>of("field", err.getField(), "message",
				err.getDefaultMessage() != null? err.getDefaultMessage() : "Error de validación")).collect(Collectors.toList());

		Map<String, Object> body = new LinkedHashMap<>();
		body.put("timestamp", Instant.now().toString());
		body.put("status", 400);
		body.put("error", "Bad Request");
		body.put("message", "Error de validación en los datos enviados");
		body.put("errors", errors);

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex)
	{
		List<Map<String, String>> errors = ex.getConstraintViolations().stream()
				.map(v -> Map.<String, String>of("field", v.getPropertyPath().toString(), "message", v.getMessage())).collect(Collectors.toList());

		Map<String, Object> body = new LinkedHashMap<>();
		body.put("timestamp", Instant.now().toString());
		body.put("status", 400);
		body.put("error", "Bad Request");
		body.put("message", "Error de validación");
		body.put("errors", errors);

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}

	@ExceptionHandler(OptimisticLockException.class)
	public ResponseEntity<Map<String, Object>> handleOptimisticLock(OptimisticLockException ex)
	{
		log.warn("OptimisticLockException: recurso modificado concurrentemente - {}", ex.getMessage());
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("timestamp", Instant.now().toString());
		body.put("status", 409);
		body.put("error", "Conflict");
		body.put("message", "El recurso fue modificado por otra operación. Reintente.");
		return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, Object>> handleServerError(Exception ex)
	{
		log.error("Error no controlado: {}", ex.getMessage(), ex);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("timestamp", Instant.now().toString(), "status", 500, "error",
				"Internal Server Error", "message", ex.getMessage() != null? ex.getMessage() : "Error interno del servidor"));
	}
}
