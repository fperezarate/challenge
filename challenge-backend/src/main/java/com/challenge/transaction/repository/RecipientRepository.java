package com.challenge.transaction.repository;

import com.challenge.transaction.entity.Recipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipientRepository extends JpaRepository<Recipient, Long> {
	boolean existsByRutAndNumeroCuenta(String rut, String numeroCuenta);
}
