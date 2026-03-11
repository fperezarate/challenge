package com.challenge.transaction.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/*
 * <p>
 * Extiende RuntimeException para no requerir manejo de excepciones en el código.
 * <p>
 * Usa ResponseStatus(HttpStatus.CONFLICT) para devolver 409 Conflict en la respuesta HTTP.
 * @author Felipe Pérez
 * @version 1.0
 * @since 2026-03-11
*/
@ResponseStatus(HttpStatus.CONFLICT)
public class RecipientAlreadyExistsException extends RuntimeException {

	public RecipientAlreadyExistsException(String message) {
		super(message);
	}
}

