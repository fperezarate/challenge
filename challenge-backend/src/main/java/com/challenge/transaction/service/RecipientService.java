package com.challenge.transaction.service;

import com.challenge.transaction.dto.CreateRecipientRequest;
import com.challenge.transaction.entity.Recipient;
import com.challenge.transaction.repository.RecipientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RecipientService {

	private static final String TIPO_CUENTA_TENPO = "Tenpo";

	private final RecipientRepository recipientRepository;

	public RecipientService(RecipientRepository recipientRepository) {
		this.recipientRepository = recipientRepository;
	}

	@Transactional(readOnly = true)
	public List<Recipient> findAll() {
		return recipientRepository.findAll();
	}

	@Transactional
	public Recipient create(CreateRecipientRequest request) {
		String normalizedRut = request.rut().trim();
		String normalizedNumeroCuenta = request.numeroCuenta().trim();

		if (recipientRepository.existsByRutAndNumeroCuenta(normalizedRut, normalizedNumeroCuenta)) {
			throw new RecipientAlreadyExistsException(
					"Ya existe un destinatario con este RUT y número de cuenta");
		}

		Recipient recipient = new Recipient();
		recipient.setNombre(request.nombre().trim());
		recipient.setRut(normalizedRut);
		recipient.setNumeroCuenta(normalizedNumeroCuenta);
		recipient.setTipoCuenta(TIPO_CUENTA_TENPO);
		recipient.setEmail(request.email().trim());
		return recipientRepository.save(recipient);
	}
}
