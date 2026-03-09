package com.challenge.transaction.service;

import com.challenge.transaction.entity.IdempotencyRecord;
import com.challenge.transaction.entity.Transaction;
import com.challenge.transaction.repository.IdempotencyRepository;
import com.challenge.transaction.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.function.Supplier;

/**
 * Servicio responsable de aplicar la semántica de idempotencia en operaciones
 * de escritura.
 * <p>
 * Usa la tabla {@link IdempotencyRecord} para recordar qué transacción se creó
 * la primera vez que se usó una clave de idempotencia, de forma que reintentos
 * con la misma clave devuelvan siempre el mismo resultado.
 */
@Service
public class IdempotencyService
{

	private static final Logger log = LoggerFactory.getLogger(IdempotencyService.class);

	private final IdempotencyRepository idempotencyRepository;
	private final TransactionRepository transactionRepository;

	public IdempotencyService(IdempotencyRepository idempotencyRepository, TransactionRepository transactionRepository)
	{
		this.idempotencyRepository = idempotencyRepository;
		this.transactionRepository = transactionRepository;
	}

	/**
	 * Resuelve una operación de forma idempotente: si la key ya existe devuelve
	 * la transacción asociada; si no, ejecuta el supplier, guarda la asociación
	 * y devuelve el resultado.
	 */
	@Transactional
	public Transaction resolve(String idempotencyKey, Supplier<Transaction> createTransaction)
	{
		Optional<IdempotencyRecord> existing = idempotencyRepository.findByIdempotencyKey(idempotencyKey);
		if(existing.isPresent())
		{
			Long transactionId = existing.get().getTransactionId();
			log.debug("Idempotencia: key ya registrada, devolviendo transacción id={}", transactionId);
			return transactionRepository.findById(transactionId)
					.orElseThrow(() -> new IllegalStateException("Transacción asociada a idempotency key no encontrada"));
		}
		log.debug("Idempotencia: key nueva, creando transacción");
		Transaction transaction = createTransaction.get();
		IdempotencyRecord record = new IdempotencyRecord(idempotencyKey, transaction.getId());
		idempotencyRepository.save(record);
		log.debug("Idempotencia: registrada key -> transactionId={}", transaction.getId());
		return transaction;
	}
}
