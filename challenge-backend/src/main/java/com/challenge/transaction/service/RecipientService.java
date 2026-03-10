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
		Recipient recipient = new Recipient();
		recipient.setNombre(request.nombre().trim());
		recipient.setRut(request.rut().trim());
		recipient.setNumeroCuenta(request.numeroCuenta().trim());
		recipient.setTipoCuenta(TIPO_CUENTA_TENPO);
		recipient.setEmail(request.email().trim());
		return recipientRepository.save(recipient);
	}
}
