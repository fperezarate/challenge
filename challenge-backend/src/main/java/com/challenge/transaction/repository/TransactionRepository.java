package com.challenge.transaction.repository;

import com.challenge.transaction.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio Spring Data JPA para la entidad {@link Transaction}.
 * <p>
 * Proporciona operaciones CRUD sobre la tabla {@code transactions} sin
 * necesidad de escribir SQL explícito.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>
{
}
