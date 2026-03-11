package com.challenge.transaction.entity;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Entidad JPA que almacena la asociación entre una clave de idempotencia
 * ({@code X-Idempotency-Key}) y la transacción creada la primera vez que se usó
 * esa clave.
 * <p>
 * Permite que el servicio de idempotencia resuelva reintentos devolviendo la
 * misma transacción sin duplicar registros en la base de datos.
 * <p>
 * Nota: este registro es de naturaleza técnica (idempotencia HTTP). Para una
 * auditoría funcional más rica (por ejemplo, cambios de estado de una
 * transacción a lo largo del tiempo) sería necesario un modelo de auditoría
 * adicional, separado de esta tabla, para no crecerla indefinidamente.
 */
@Entity
@Table(name = "idempotency_record", indexes = {@Index(name = "idx_idempotency_key", columnList = "idempotency_key", unique = true)})
public class IdempotencyRecord
{

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "idempotency_key", nullable = false, unique = true, length = 36)
	private String idempotencyKey;

	@Column(name = "transaction_id", nullable = false)
	private Long transactionId;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	public IdempotencyRecord()
	{
	}

	public IdempotencyRecord(String idempotencyKey, Long transactionId)
	{
		this.idempotencyKey = idempotencyKey;
		this.transactionId = transactionId;
		this.createdAt = Instant.now();
	}

	public Long getId()
	{
		return id;
	}

	public void setId(Long id)
	{
		this.id = id;
	}

	public String getIdempotencyKey()
	{
		return idempotencyKey;
	}

	public void setIdempotencyKey(String idempotencyKey)
	{
		this.idempotencyKey = idempotencyKey;
	}

	public Long getTransactionId()
	{
		return transactionId;
	}

	public void setTransactionId(Long transactionId)
	{
		this.transactionId = transactionId;
	}

	public Instant getCreatedAt()
	{
		return createdAt;
	}

	public void setCreatedAt(Instant createdAt)
	{
		this.createdAt = createdAt;
	}
}
