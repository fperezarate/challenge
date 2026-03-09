package com.challenge.transaction.exception;

import jakarta.persistence.OptimisticLockException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest
{

	private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

	@Test
	@DisplayName("OptimisticLockException devuelve 409 Conflict")
	void optimisticLockReturns409()
	{
		ResponseEntity<Map<String, Object>> response = handler.handleOptimisticLock(new OptimisticLockException());

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().get("status")).isEqualTo(409);
		assertThat(response.getBody().get("error")).isEqualTo("Conflict");
		assertThat(response.getBody().get("message")).asString().contains("modificado");
	}
}
