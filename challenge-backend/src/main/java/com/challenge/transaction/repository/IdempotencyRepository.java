package com.challenge.transaction.repository;

import com.challenge.transaction.entity.IdempotencyRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio Spring Data JPA para {@link IdempotencyRecord}.
 * <p>
 * Se utiliza por el servicio de idempotencia para consultar y persistir la
 * relación entre claves de idempotencia y transacciones.
 */
@Repository
public interface IdempotencyRepository extends JpaRepository<IdempotencyRecord, Long>
{

	Optional<IdempotencyRecord> findByIdempotencyKey(String idempotencyKey);
}
