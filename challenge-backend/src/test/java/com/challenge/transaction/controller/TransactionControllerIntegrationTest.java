package com.challenge.transaction.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TransactionControllerIntegrationTest
{

	@Autowired
	private MockMvc mockMvc;

	private static final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

	private static String validBody(LocalDateTime date) throws Exception
	{
		return objectMapper.writeValueAsString(new CreateTransactionBody(1000, "Comercio Test", "Tenpista Test", date));
	}

	private record CreateTransactionBody(Integer monto, String giroComercio, String nombreTenpista, LocalDateTime fechaTransaccion) {
	}

	@Nested
	@DisplayName("POST /transaction")
	class Create
	{

		@Test
		@DisplayName("rechaza cuando falta X-Idempotency-Key con 400")
		void rejectsMissingIdempotencyKey() throws Exception
		{
			String body = validBody(LocalDateTime.now());
			mockMvc.perform(post("/transaction").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isBadRequest())
					.andExpect(jsonPath("$.message").value(containsString("X-Idempotency-Key")));
		}

		@Test
		@DisplayName("rechaza monto negativo con 400")
		void rejectsNegativeAmount() throws Exception
		{
			String body = objectMapper.writeValueAsString(new CreateTransactionBody(-1, "Comercio", "Tenpista", LocalDateTime.now()));

			mockMvc.perform(post("/transaction").header("X-Idempotency-Key", java.util.UUID.randomUUID().toString()).contentType(MediaType.APPLICATION_JSON)
					.content(body)).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("crea transacción válida y persiste")
		void createsValidTransactionAndPersists() throws Exception
		{
			LocalDateTime now = LocalDateTime.now();
			String body = validBody(now);
			String idempotencyKey = java.util.UUID.randomUUID().toString();

			ResultActions createResult = mockMvc
					.perform(post("/transaction").header("X-Idempotency-Key", idempotencyKey).contentType(MediaType.APPLICATION_JSON).content(body))
					.andExpect(status().isCreated()).andExpect(content().contentType(MediaType.APPLICATION_JSON)).andExpect(jsonPath("$.id").exists())
					.andExpect(jsonPath("$.monto").value(1000)).andExpect(jsonPath("$.giroComercio").value("Comercio Test"))
					.andExpect(jsonPath("$.nombreTenpista").value("Tenpista Test"));

			String responseBody = createResult.andReturn().getResponse().getContentAsString();
			Long id = objectMapper.readTree(responseBody).get("id").asLong();

			mockMvc.perform(get("/transaction")).andExpect(status().isOk()).andExpect(jsonPath("$[?(@.id == " + id + ")]").value(hasSize(1)));
		}

		@Test
		@DisplayName("misma X-Idempotency-Key devuelve la misma transacción sin duplicar")
		void sameIdempotencyKeyReturnsSameTransaction() throws Exception
		{
			LocalDateTime now = LocalDateTime.now();
			String body = validBody(now);
			String idempotencyKey = java.util.UUID.randomUUID().toString();

			ResultActions first = mockMvc
					.perform(post("/transaction").header("X-Idempotency-Key", idempotencyKey).contentType(MediaType.APPLICATION_JSON).content(body))
					.andExpect(status().isCreated()).andExpect(jsonPath("$.id").exists());
			Long firstId = objectMapper.readTree(first.andReturn().getResponse().getContentAsString()).get("id").asLong();

			mockMvc.perform(post("/transaction").header("X-Idempotency-Key", idempotencyKey).contentType(MediaType.APPLICATION_JSON).content(body))
					.andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(firstId)).andExpect(jsonPath("$.monto").value(1000));

			mockMvc.perform(get("/transaction")).andExpect(status().isOk()).andExpect(jsonPath("$[?(@.id == " + firstId + ")]").value(hasSize(1)));
		}
	}
}
