# Transaction API (Challenge Fullstack - Backend)

API REST en Spring Boot 3 con Java 21 para gestión de transacciones Tenpista. PostgreSQL como base de datos. Incluye **idempotencia** (header `X-Idempotency-Key`), **logging con UUID** (`X-Request-ID` en MDC) y **bloqueo optimista** (`@Version` en la entidad Transaction).

## Requisitos

- Java 21
- Maven 3.8+
- PostgreSQL en ejecución (local o Docker)

## Configuración de la base de datos

1. En pgAdmin (o tu cliente), crea una base de datos si aún no tienes (ej: `challenge-tenpo` o `transactions_db`).
2. En `src/main/resources/application.properties` ajusta la conexión si es necesario:
   - **spring.datasource.url:** Por defecto `jdbc:postgresql://localhost:5432/challenge-tenpo`. Puedes sobrescribir con variable de entorno.
   - **spring.datasource.username:** Por defecto usa `feliperez`. Sobrescribe con `DB_USERNAME`.
   - **spring.datasource.password:** Configúrala con `DB_PASSWORD` o en el archivo.

Ejemplo con variables de entorno:

```bash
export DB_USERNAME=postgres
export DB_PASSWORD=mipassword
```

## Ejecutar la aplicación

```bash
./mvnw spring-boot:run
```

O con Maven instalado globalmente:

```bash
mvn spring-boot:run
```

La API quedará en **http://localhost:8080**.

Puedes explorar e interactuar con la API desde **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html).

## Formatear código

El proyecto usa el estilo definido en `eclipse-formatter.xml` (perfil "fperez format"). Para aplicar el formateo a todo el código Java:

```bash
mvn formatter:format
```

Para comprobar si hay archivos que no cumplen el estilo (sin modificar):

```bash
mvn formatter:validate
```

En Cursor/VS Code puedes ejecutar la tarea Maven "formatter:format" desde la paleta de comandos o asignar un atajo.

## Endpoints

| Método | Ruta         | Descripción              |
|--------|--------------|--------------------------|
| GET    | /transaction | Lista todas las transacciones |
| POST   | /transaction | Crea una transacción. **Requerido:** header `X-Idempotency-Key` (UUID). Body: monto, giroComercio, nombreTenpista, fechaTransaccion. Si se reenvía la misma key, se devuelve la transacción ya creada (201, mismo ID). |

Al arrancar, JPA creará/actualizará las tablas `transactions` e `idempotency_record` en tu base de datos (`ddl-auto: update`). El esquema SQL de referencia está en `src/main/resources/schema.sql`.

### Headers y trazabilidad

- **X-Idempotency-Key** (obligatorio en POST): UUID generado por el cliente; evita duplicados por doble clic o reintentos.
- **X-Request-ID**: Si el cliente lo envía, se usa para logs; si no, el servidor genera uno y lo devuelve en la respuesta.
- **User-Agent / X-App-Version**: Metadatos opcionales enviados por el frontend para logging.

## Ejecutar con Docker

Desde la raíz del proyecto:

```bash
docker compose up -d
```

Se levantarán:
- **PostgreSQL** en el puerto 5432 (usuario `postgres`, contraseña `postgres`, base de datos `challenge-tenpo`).
- **Backend** en http://localhost:8080 (Swagger: http://localhost:8080/swagger-ui.html).

Para detener:

```bash
docker compose down
```

Para reconstruir la imagen del backend tras cambios:

```bash
docker compose up -d --build
```

## Idempotencia y consistencia

- **Idempotencia:** Se usa una tabla en PostgreSQL (`idempotency_record`) que asocia cada `X-Idempotency-Key` al ID de la transacción creada. La primera petición con una key crea la transacción; las siguientes devuelven la misma sin crear otra.
- **Bloqueo optimista:** La entidad `Transaction` tiene un campo `version` (`@Version`). En futuras actualizaciones concurrentes, si la versión no coincide se responde 409 Conflict.
- **Logging:** Logback configurado en `src/main/resources/logback-spring.xml`: salida a consola con formato que incluye el UUID de la petición (`[%X{requestId:-}]`) en cada línea. El paquete `com.challenge.transaction` está en nivel DEBUG para depuración (entrada/salida de endpoints, idempotencia). El filtro `RequestIdFilter` pone el `X-Request-ID` en el MDC.

### Sobre seguridad (por qué no hay login completo)

En un entorno real, esta API debería exponerse detrás de un sistema de autenticación/autorización (por ejemplo, Spring Security + JWT o el IdP corporativo de Tenpo). Para este challenge se decidió **no implementar toda la capa de login/registro/refresh tokens** porque:

- Añadir usuarios, credenciales, flujo de login y manejo completo de JWT desplazaría el foco del ejercicio (transacciones, idempotencia, trazabilidad).
- La mayoría de la lógica de seguridad (gestión de identidades, revocación de tokens, permisos finos) pertenece a servicios de identidad compartidos a nivel empresa, no al microservicio de transacciones en sí.

En un siguiente paso, la aproximación natural sería:

- Integrar Spring Security con un filtro JWT que valide `Authorization: Bearer <token>` emitido por el IdP de Tenpo.
- Restringir el acceso a `/transaction/**` a usuarios autenticados/rolados.
- Delegar la emisión/rotación de tokens a un servicio especializado, manteniendo este proyecto enfocado en reglas de negocio (idempotencia, consistencia y logging).

## Tests

- `mvn test` ejecuta tests unitarios (servicio con mocks, handler de `OptimisticLockException`) e integración (POST con/sin idempotency key, misma key devuelve mismo ID).
- En entornos con JDK 21+ donde Mockito falla por "Could not self-attach", se usa el mock maker **subclass** vía `src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker` (contenido: `mock-maker-subclass`).

## Estructura del proyecto

```
src/main/java/com/challenge/transaction/
├── TransactionApplication.java
├── config/
│   └── WebConfig.java
├── controller/
│   └── TransactionController.java
├── dto/
│   └── CreateTransactionRequest.java
├── entity/
│   └── Transaction.java          (incluye @Version)
│   └── IdempotencyRecord.java
├── exception/
│   └── GlobalExceptionHandler.java   (incluye OptimisticLockException → 409)
├── filter/
│   └── RequestIdFilter.java      (X-Request-ID en MDC y respuesta)
├── repository/
│   └── TransactionRepository.java
│   └── IdempotencyRepository.java
└── service/
    └── TransactionService.java
    └── IdempotencyService.java
```
