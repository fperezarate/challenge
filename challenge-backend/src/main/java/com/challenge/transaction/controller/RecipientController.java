package com.challenge.transaction.controller;

import com.challenge.transaction.dto.CreateRecipientRequest;
import com.challenge.transaction.entity.Recipient;
import com.challenge.transaction.service.RecipientService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
 * Controlador REST para el recurso de destinatarios. <p> Expone endpoints bajo
 * {@code /recipient} para: <ul> <li>Listar todos los destinatarios persistidos
 * (GET).</li> <li>Crear un nuevo destinatario (POST).</li> </ul>
 */

@RestController
@RequestMapping("/recipient")
public class RecipientController
{

	private static final Logger log = LoggerFactory.getLogger(RecipientController.class);

	private final RecipientService recipientService;

	public RecipientController(RecipientService recipientService)
	{
		this.recipientService = recipientService;
	}

	/*
	 * Obtiene todos los destinatarios persistidos. <p> Registra eventos de
	 * debug en los logs con el {@code X-Request-ID} gestionado por el filtro de
	 * request.
	 *
	 * @return ResponseEntity con la lista de destinatarios encontrados.
	 */
	@GetMapping
	public ResponseEntity<List<Recipient>> getAll()
	{
		log.debug("GET /recipient - listando destinatarios");
		List<Recipient> recipients = recipientService.findAll();
		log.debug("GET /recipient - encontrados {} destinatarios", recipients.size());
		return ResponseEntity.ok(recipients);
	}

	/*
	 * Crea un nuevo destinatario. <p> Registra eventos de info en los logs con
	 * el {@code X-Request-ID} gestionado por el filtro de request.
	 *
	 * @param request Datos del destinatario a crear.
	 *
	 * @return ResponseEntity con el destinatario creado.
	 */
	@PostMapping
	public ResponseEntity<Recipient> create(@Valid @RequestBody CreateRecipientRequest request)
	{
		log.info("POST /recipient - nombre={}", request.nombre());
		Recipient saved = recipientService.create(request);
		log.info("POST /recipient - destinatario creado id={}", saved.getId());
		return ResponseEntity.status(HttpStatus.CREATED).body(saved);
	}
}
