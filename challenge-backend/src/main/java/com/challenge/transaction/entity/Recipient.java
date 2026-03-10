package com.challenge.transaction.entity;

import jakarta.persistence.*;

/**
 * Entidad JPA que representa un destinatario (recipient) para transacciones.
 * Lista global: todos los usuarios comparten la misma lista de destinatarios.
 * Tipo de cuenta fijo: "Tenpo".
 */
@Entity
@Table(name = "recipients")
public class Recipient {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "nombre", nullable = false, length = 255)
	private String nombre;

	@Column(name = "rut", nullable = false, length = 20)
	private String rut;

	@Column(name = "numero_cuenta", nullable = false, length = 50)
	private String numeroCuenta;

	@Column(name = "tipo_cuenta", nullable = false, length = 50)
	private String tipoCuenta = "Tenpo";

	@Column(name = "email", nullable = false, length = 255)
	private String email;

	public Recipient() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getRut() {
		return rut;
	}

	public void setRut(String rut) {
		this.rut = rut;
	}

	public String getNumeroCuenta() {
		return numeroCuenta;
	}

	public void setNumeroCuenta(String numeroCuenta) {
		this.numeroCuenta = numeroCuenta;
	}

	public String getTipoCuenta() {
		return tipoCuenta;
	}

	public void setTipoCuenta(String tipoCuenta) {
		this.tipoCuenta = tipoCuenta;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
}
