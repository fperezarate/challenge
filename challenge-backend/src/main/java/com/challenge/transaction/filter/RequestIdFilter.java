package com.challenge.transaction.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/*
 * Filtro para agregar el header X-Request-ID a las peticiones HTTP.
 * @author Felipe Pérez
 * @version 1.0
 * @since 2026-03-09
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter
{

	private static final Logger log = LoggerFactory.getLogger(RequestIdFilter.class);

	public static final String REQUEST_ID_HEADER = "X-Request-ID";
	public static final String MDC_REQUEST_ID = "requestId";

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
			throws ServletException, IOException
	{
		String requestId = request.getHeader(REQUEST_ID_HEADER);
		if(requestId == null || requestId.isBlank())
		{
			requestId = UUID.randomUUID().toString();
		}
		MDC.put(MDC_REQUEST_ID, requestId);
		response.setHeader(REQUEST_ID_HEADER, requestId);
		log.debug("Request {} {}", request.getMethod(), request.getRequestURI());
		try
		{
			filterChain.doFilter(request, response);
		}
		finally
		{
			MDC.clear();
		}
	}
}
