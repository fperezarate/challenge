package com.challenge.transaction.controller;

import com.challenge.transaction.dto.CreateRecipientRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RecipientControllerIntegrationTest
{

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Nested
	@DisplayName("POST /recipient")
	class Create
	{

		@Test
		@DisplayName("crea destinatario válido y persiste")
		void createsValidRecipientAndPersists() throws Exception
		{
			CreateRecipientRequest body = new CreateRecipientRequest("Nombre Destinatario", "11.111.111-1", "123456789", "correo@ejemplo.cl");

			String json = objectMapper.writeValueAsString(body);

			mockMvc.perform(post("/recipient").contentType(MediaType.APPLICATION_JSON).content(json)).andExpect(status().isCreated())
					.andExpect(jsonPath("$.id").exists()).andExpect(jsonPath("$.nombre", is("Nombre Destinatario")))
					.andExpect(jsonPath("$.rut", is("11.111.111-1"))).andExpect(jsonPath("$.numeroCuenta", is("123456789")))
					.andExpect(jsonPath("$.email", is("correo@ejemplo.cl"))).andExpect(jsonPath("$.tipoCuenta", is("Tenpo")));
		}

		@Test
		@DisplayName("rechaza email inválido con 400")
		void rejectsInvalidEmail() throws Exception
		{
			CreateRecipientRequest body = new CreateRecipientRequest("Nombre Destinatario", "11.111.111-1", "123456789", "no-es-email");

			String json = objectMapper.writeValueAsString(body);

			mockMvc.perform(post("/recipient").contentType(MediaType.APPLICATION_JSON).content(json)).andExpect(status().isBadRequest());
		}
	}

	@Nested
	@DisplayName("GET /recipient")
	class GetAll
	{

		@Test
		@DisplayName("devuelve la lista de destinatarios existentes")
		void returnsExistingRecipients() throws Exception
		{
			CreateRecipientRequest body = new CreateRecipientRequest("Otro Destinatario", "22.222.222-2", "987654321", "otro@ejemplo.cl");
			String json = objectMapper.writeValueAsString(body);

			mockMvc.perform(post("/recipient").contentType(MediaType.APPLICATION_JSON).content(json)).andExpect(status().isCreated());

			mockMvc.perform(get("/recipient")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(org.hamcrest.Matchers.greaterThanOrEqualTo(1))));
		}
	}
}
