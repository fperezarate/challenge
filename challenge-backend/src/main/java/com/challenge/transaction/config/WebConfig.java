package com.challenge.transaction.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/*
 * Configuración de CORS para permitir solicitudes desde el frontend.
 * @author Felipe Pérez
 * @version 1.0
 * @since 2026-03-09
 */
@Configuration
public class WebConfig
{

	@Value("${app.cors.allowed-origins:http://localhost:3000}")
	private String allowedOrigins;

	@Bean
	public CorsFilter corsFilter()
	{
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowCredentials(true);
		config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
		config.addAllowedHeader("*");
		config.addAllowedMethod("GET");
		config.addAllowedMethod("POST");
		config.addAllowedMethod("PUT");
		config.addAllowedMethod("DELETE");
		config.addAllowedMethod("OPTIONS");

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return new CorsFilter(source);
	}
}
