package com.challenge.transaction.controller;

import com.challenge.transaction.dto.CreateTransactionRequest;
import com.challenge.transaction.entity.Transaction;
import com.challenge.transaction.service.TransactionService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para el recurso de transacciones.
 * <p>
 * Expone endpoints bajo {@code /transaction} para:
 * <ul>
 *   <li>Listar todas las transacciones persistidas (GET).</li>
 *   <li>Crear una nueva transacción de forma idempotente (POST), exigiendo el
 *   header {@code X-Idempotency-Key} generado por el frontend.</li>
 * </ul>
 * Se apoya en {@link TransactionService} y registra eventos relevantes en los
 * logs junto al {@code X-Request-ID} gestionado por el filtro de request.
 * <p>
 * Si el sistema evolucionara hacia una auditoría más exhaustiva a nivel de
 * negocio (por ejemplo, trazabilidad regulatoria), las acciones expuestas por
 * este controlador deberían disparar también un flujo de auditoría separado
 * (eventos o tablas de auditoría), ya que registrar todo en la misma tabla de
 * transacciones puede generar un volumen considerable de datos históricos.
 */
@RestController
@RequestMapping("/transaction")
public class TransactionController
{

	private static final Logger log = LoggerFactory.getLogger(TransactionController.class);

	private final TransactionService transactionService;

	public TransactionController(TransactionService transactionService)
	{
		this.transactionService = transactionService;
	}

	/**
	 * Obtiene todas las transacciones persistidas.
	 * <p>
	 * Registra eventos de debug en los logs con el {@code X-Request-ID} gestionado
	 * por el filtro de request.
	 * @return ResponseEntity con la lista de transacciones encontradas.
	 */
	@GetMapping
	public ResponseEntity<List<Transaction>> getAll()
	{
		log.debug("GET /transaction - listando transacciones");
		List<Transaction> transactions = transactionService.findAll();
		log.debug("GET /transaction - encontradas {} transacciones", transactions.size());
		return ResponseEntity.ok(transactions);
	}

	/**
	 * Crea una nueva transacción de forma idempotente.
	 * <p>
	 * Registra eventos de info en los logs con el {@code X-Request-ID} gestionado
	 * por el filtro de request.
	 * @param idempotencyKey Clave de idempotencia generada por el frontend.
	 * @param request Datos de la transacción a crear.
	 * @return ResponseEntity con la transacción creada o devuelta.
	 */
	@PostMapping
	public ResponseEntity<?> create(@RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey, @Valid @RequestBody CreateTransactionRequest request)
	{
		if(idempotencyKey == null || idempotencyKey.isBlank())
		{
			log.warn("POST /transaction rechazado: falta header X-Idempotency-Key");
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(new IdempotencyKeyMissingResponse("Header X-Idempotency-Key es obligatorio para crear transacciones."));
		}
		String key = idempotencyKey.trim();
		log.info("POST /transaction - idempotencyKey={}, monto={}, giroComercio={}", key, request.monto(), request.giroComercio());
		Transaction saved = transactionService.create(request, key);
		log.info("POST /transaction - transacción creada o devuelta id={}", saved.getId());
		return ResponseEntity.status(HttpStatus.CREATED).body(saved);
	}

	/**
	 * Respuesta para cuando falta el header X-Idempotency-Key.
	 * Este record es usado como body de respuesta HTTP 400 en el caso de que el header requerido no esté presente
	 * en la petición al crear una transacción vía POST /transaction.
	 * 
	 * Si la petición no incluye el header X-Idempotency-Key, el método create retorna una respuesta con status 400
	 * y una instancia de esta clase como body. La estructura JSON será: {"message": "..."}.
	 *
	 * Ejemplo de uso:
	 *   return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	 *          .body(new IdempotencyKeyMissingResponse("Header X-Idempotency-Key es obligatorio para crear transacciones."));
	 */
	public record IdempotencyKeyMissingResponse(String message) { }
}
