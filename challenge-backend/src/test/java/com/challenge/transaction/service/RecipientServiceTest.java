package com.challenge.transaction.service;

import com.challenge.transaction.dto.CreateRecipientRequest;
import com.challenge.transaction.entity.Recipient;
import com.challenge.transaction.repository.RecipientRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecipientServiceTest {

	@Mock
	private RecipientRepository recipientRepository;

	@InjectMocks
	private RecipientService recipientService;

	@Nested
	@DisplayName("findAll")
	class FindAll {

		@Test
		@DisplayName("retorna la lista devuelta por el repositorio")
		void returnsListFromRepository() {
			List<Recipient> expected = List.of(new Recipient(), new Recipient());
			when(recipientRepository.findAll()).thenReturn(expected);

			List<Recipient> result = recipientService.findAll();

			assertThat(result).isSameAs(expected);
			verify(recipientRepository).findAll();
		}
	}

	@Nested
	@DisplayName("create")
	class Create {

		@Test
		@DisplayName("crea un destinatario con campos normalizados y tipo Tenpo")
		void createsRecipientWithNormalizedFieldsAndTenpoType() {
			CreateRecipientRequest request = new CreateRecipientRequest(
					"  Nombre Destinatario  ",
					"  11.111.111-1  ",
					"  123456789  ",
					"  correo@ejemplo.cl  "
			);

			Recipient persisted = new Recipient();
			persisted.setId(1L);
			when(recipientRepository.save(org.mockito.Mockito.any(Recipient.class))).thenReturn(persisted);

			Recipient result = recipientService.create(request);

			ArgumentCaptor<Recipient> captor = ArgumentCaptor.forClass(Recipient.class);
			verify(recipientRepository).save(captor.capture());
			Recipient saved = captor.getValue();

			assertThat(saved.getNombre()).isEqualTo("Nombre Destinatario");
			assertThat(saved.getRut()).isEqualTo("11.111.111-1");
			assertThat(saved.getNumeroCuenta()).isEqualTo("123456789");
			assertThat(saved.getEmail()).isEqualTo("correo@ejemplo.cl");
			assertThat(saved.getTipoCuenta()).isEqualTo("Tenpo");
			assertThat(result).isSameAs(persisted);
		}
	}
}

