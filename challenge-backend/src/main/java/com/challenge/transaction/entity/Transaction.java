package com.challenge.transaction.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad JPA que representa una transacción Tenpista almacenada en PostgreSQL.
 * <p>
 * Se mapea a la tabla {@code transactions} y es gestionada por Spring Data JPA.
 * El campo {@link #version} está anotado con {@link Version} para habilitar
 * bloqueo optimista en escenarios de actualización concurrente.
 * <p>
 * Nota de escalabilidad: si el proyecto requiere auditoría de negocio
 * (histórico de quién creó/modificó cada transacción, desde qué origen, etc.),
 * suele ser preferible modelar tablas de auditoría específicas o columnas
 * dedicadas en vez de sobrecargar esta tabla con demasiados metadatos, ya que
 * el volumen de escritura puede crecer de forma significativa.
 */
@Entity
@Table(name = "transactions")
public class Transaction
{

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "monto", nullable = false)
	private Integer monto;

	@Column(name = "giro_comercio", length = 255)
	private String giroComercio;

	@Column(name = "nombre_tenpista", length = 255)
	private String nombreTenpista;

	@Column(name = "fecha_transaccion", nullable = false)
	private LocalDateTime fechaTransaccion;

	@Version
	@Column(name = "version")
	private Long version;

	public Transaction()
	{
	}

	public Long getId()
	{
		return id;
	}

	public void setId(Long id)
	{
		this.id = id;
	}

	public Integer getMonto()
	{
		return monto;
	}

	public void setMonto(Integer monto)
	{
		this.monto = monto;
	}

	public String getGiroComercio()
	{
		return giroComercio;
	}

	public void setGiroComercio(String giroComercio)
	{
		this.giroComercio = giroComercio;
	}

	public String getNombreTenpista()
	{
		return nombreTenpista;
	}

	public void setNombreTenpista(String nombreTenpista)
	{
		this.nombreTenpista = nombreTenpista;
	}

	public LocalDateTime getFechaTransaccion()
	{
		return fechaTransaccion;
	}

	public void setFechaTransaccion(LocalDateTime fechaTransaccion)
	{
		this.fechaTransaccion = fechaTransaccion;
	}

	public Long getVersion()
	{
		return version;
	}

	public void setVersion(Long version)
	{
		this.version = version;
	}
}
