package com.challenge.transaction.service;

import com.challenge.transaction.dto.CreateTransactionRequest;
import com.challenge.transaction.entity.Transaction;
import com.challenge.transaction.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio de aplicación para gestionar el ciclo de vida de las transacciones.
 * <p>
 * Expone operaciones de lectura y creación sobre {@link Transaction} apoyándose
 * en {@link TransactionRepository} y delega la idempotencia en
 * {@link IdempotencyService}, de modo que las creaciones con la misma clave
 * {@code X-Idempotency-Key} no generen duplicados en la base de datos.
 * <p>
 * En un escenario de mayor escala y requisitos de auditoría estricta, este
 * servicio sería un buen punto para integrar un componente de auditoría de
 * negocio (p. ej. publicar eventos de dominio o persistir entradas en una
 * tabla de auditoría dedicada). Esa aproximación aumenta el volumen de
 * escritura en la base de datos y debe diseñarse teniendo en cuenta costes y
 * retención.
 */
@Service
public class TransactionService
{

	private final TransactionRepository transactionRepository;
	private final IdempotencyService idempotencyService;

	public TransactionService(TransactionRepository transactionRepository, IdempotencyService idempotencyService)
	{
		this.transactionRepository = transactionRepository;
		this.idempotencyService = idempotencyService;
	}

	@Transactional(readOnly = true)
	public List<Transaction> findAll()
	{
		return transactionRepository.findAll();
	}

	@Transactional
	public Transaction save(Transaction transaction)
	{
		return transactionRepository.save(transaction);
	}

	@Transactional
	public Transaction create(CreateTransactionRequest request, String idempotencyKey)
	{
		return idempotencyService.resolve(idempotencyKey, () -> createNew(request));
	}

	/*
	 * Crea una nueva transacción.
	 * @param request La solicitud de creación de transacción.
	 * @return La transacción creada.
	 */
	private Transaction createNew(CreateTransactionRequest request)
	{
		Transaction transaction = new Transaction();
		transaction.setMonto(request.monto());
		transaction.setGiroComercio(request.giroComercio());
		transaction.setNombreTenpista(request.nombreTenpista());
		transaction.setFechaTransaccion(request.fechaTransaccion());
		return transactionRepository.save(transaction);
	}
}
