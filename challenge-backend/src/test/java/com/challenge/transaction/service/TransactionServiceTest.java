package com.challenge.transaction.service;

import com.challenge.transaction.dto.CreateTransactionRequest;
import com.challenge.transaction.entity.Transaction;
import com.challenge.transaction.repository.TransactionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Supplier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest
{

	@Mock
	private TransactionRepository transactionRepository;

	@Mock
	private IdempotencyService idempotencyService;

	@InjectMocks
	private TransactionService transactionService;

	@Nested
	@DisplayName("findAll")
	class FindAll
	{

		@Test
		@DisplayName("retorna la lista devuelta por el repositorio")
		void returnsListFromRepository()
		{
			List<Transaction> expected = List.of(new Transaction(), new Transaction());
			when(transactionRepository.findAll()).thenReturn(expected);

			List<Transaction> result = transactionService.findAll();

			assertThat(result).isSameAs(expected);
			verify(transactionRepository).findAll();
		}
	}

	@Nested
	@DisplayName("create")
	class Create
	{

		@Test
		@DisplayName("delega en IdempotencyService y persiste correctamente")
		void delegatesToIdempotencyAndSaves()
		{
			LocalDateTime now = LocalDateTime.now();
			CreateTransactionRequest request = new CreateTransactionRequest(1000, "Comercio Test", "Tenpista Test", now);
			Transaction savedTransaction = new Transaction();
			savedTransaction.setId(1L);
			savedTransaction.setMonto(1000);
			savedTransaction.setGiroComercio("Comercio Test");
			savedTransaction.setNombreTenpista("Tenpista Test");
			savedTransaction.setFechaTransaccion(now);
			when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);
			when(idempotencyService.resolve(eq("key-1"), any(Supplier.class))).thenAnswer(inv -> {
				@SuppressWarnings("unchecked")
				Supplier<Transaction> supplier = inv.getArgument(1);
				return supplier.get();
			});

			Transaction result = transactionService.create(request, "key-1");

			ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
			verify(transactionRepository).save(captor.capture());
			Transaction captured = captor.getValue();
			assertThat(captured.getMonto()).isEqualTo(1000);
			assertThat(captured.getGiroComercio()).isEqualTo("Comercio Test");
			assertThat(captured.getNombreTenpista()).isEqualTo("Tenpista Test");
			assertThat(captured.getFechaTransaccion()).isEqualTo(now);
			assertThat(result).isSameAs(savedTransaction);
			verify(idempotencyService).resolve(eq("key-1"), any(Supplier.class));
		}
	}
}
