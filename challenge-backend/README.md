# Transaction API (Challenge Fullstack - Backend)

API REST en Spring Boot 3 con Java 21 para gestión de **transacciones Tenpista** y **destinatarios Tenpo**. Usa PostgreSQL como base de datos e incluye **idempotencia** (header `X-Idempotency-Key`), **logging con UUID** (`X-Request-ID` en MDC) y **bloqueo optimista** (`@Version` en la entidad `Transaction`).

## Requisitos

- Java 21
- Maven 3.8+
- PostgreSQL en ejecución (local o Docker)

## Configuración de la base de datos (local)

En `src/main/resources/application.properties` se define la conexión por defecto para entorno local:

- `spring.datasource.url=jdbc:postgresql://localhost:5432/challenge-tenpo`
- `spring.datasource.username=${DB_USERNAME:feliperez}`
- `spring.datasource.password=${DB_PASSWORD:}`

### Crear la base de datos en PostgreSQL

Desde tu terminal, con PostgreSQL instalado localmente, puedes crear la base así:

```bash
# Usando createdb (si tu usuario de sistema tiene permisos)
createdb challenge-tenpo

# O bien entrando a psql y ejecutando:
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE \"challenge-tenpo\";"
```

Luego, ajusta `DB_USERNAME` / `DB_PASSWORD` vía variables de entorno si es necesario, por ejemplo:

```bash
export DB_USERNAME=postgres
export DB_PASSWORD=mipassword
```

## Ejecutar la aplicación en local (sin Docker)

Desde la raíz de `challenge-backend`:

```bash
./mvnw spring-boot:run
```

O con Maven instalado globalmente:

```bash
mvn spring-boot:run
```

Por configuración (`server.port=8081`), la API quedará accesible en:

- **http://localhost:8081**
- Swagger UI: **http://localhost:8081/swagger-ui.html**

## Formatear código

El proyecto usa el estilo definido en `eclipse-formatter.xml` (perfil "fperez format"). Para aplicar el formateo a todo el código Java:

```bash
mvn formatter:format
```

Para comprobar si hay archivos que no cumplen el estilo (sin modificar):

```bash
mvn formatter:validate
```

En Cursor/VS Code puedes ejecutar la tarea Maven `formatter:format` desde la paleta de comandos o asignar un atajo.

## Endpoints

Con la aplicación arriba, la API expone los siguientes recursos:

| Método | Ruta         | Descripción |
|--------|--------------|-------------|
| GET    | `/transaction` | Lista todas las transacciones. |
| POST   | `/transaction` | Crea una transacción. **Requerido:** header `X-Idempotency-Key` (UUID). Body JSON: `monto`, `giroComercio`, `nombreTenpista`, `fechaTransaccion`. Si se reenvía la misma key, se devuelve la transacción ya creada (201, mismo ID). |
| GET    | `/recipient` | Lista todos los destinatarios Tenpo almacenados. |
| POST   | `/recipient` | Crea un destinatario Tenpo. Body JSON: `nombre`, `rut`, `numeroCuenta`, `email`. El backend fija `tipoCuenta = "Tenpo"` y valida que no exista un destinatario duplicado (RUT + número de cuenta). Si ya existe, responde con error de negocio. |

Al arrancar, JPA creará/actualizará las tablas necesarias (`transactions`, `recipients`, `idempotency_record`) en tu base de datos (`spring.jpa.hibernate.ddl-auto=update`).

### Headers y trazabilidad

- **X-Idempotency-Key** (obligatorio en POST `/transaction`): UUID generado por el cliente; evita duplicados por doble clic o reintentos.
- **X-Request-ID**: Si el cliente lo envía, se usa para logs; si no, el servidor genera uno y lo devuelve en la respuesta.
- **User-Agent / X-App-Version**: Metadatos opcionales enviados por el frontend para logging.

## Ejecutar con Docker (solo backend + DB)

Desde la raíz de `challenge-backend` existe un `docker-compose.yml` que levanta **PostgreSQL** y el **backend**:

```bash
docker compose up -d
```

Este archivo utiliza:

- Base de datos `tenpo` con usuario `tenpo` y contraseña `password-tenpo`.
- Variable `SPRING_DATASOURCE_URL` apuntando a `jdbc:postgresql://db:5432/tenpo`.
- Backend expuesto en el puerto **8080** (asegúrate de alinear `server.port` o la variable `SERVER_PORT` con este valor al construir la imagen).

Accesos esperados:

- **Backend**: `http://localhost:8080`
- **Swagger**: `http://localhost:8080/swagger-ui.html`

Para detener:

```bash
docker compose down
```

Para reconstruir la imagen del backend tras cambios:

```bash
docker compose up -d --build
```

> Nota: Para levantar TODO el stack (frontend + backend + DB) se recomienda usar el `docker-compose.yml` de `challenge-tenpo`, descrito en el README de ese proyecto.

## Idempotencia, destinatarios y consistencia

- **Idempotencia:** Se usa una tabla en PostgreSQL (`idempotency_record`) que asocia cada `X-Idempotency-Key` al ID de la transacción creada. La primera petición con una key crea la transacción; las siguientes devuelven la misma sin crear otra.
- **Bloqueo optimista:** La entidad `Transaction` tiene un campo `version` (`@Version`). En futuras actualizaciones concurrentes, si la versión no coincide se responde 409 *Conflict*.
- **Logging:** Logback configurado en `src/main/resources/logback-spring.xml`: salida a consola con formato que incluye el UUID de la petición (`[%X{requestId:-}]`) en cada línea. El paquete `com.challenge.transaction` está en nivel DEBUG para depuración (entrada/salida de endpoints, idempotencia, destinatarios). El filtro `RequestIdFilter` pone el `X-Request-ID` en el MDC.
- **Destinatarios Tenpo:** La entidad `Recipient` modela los destinatarios Tenpo. El servicio `RecipientService` aplica validaciones de dominio y evita duplicados lanzando `RecipientAlreadyExistsException` cuando corresponde.

### Sobre seguridad (por qué no hay login completo)

En un entorno real, esta API debería exponerse detrás de un sistema de autenticación/autorización (por ejemplo, Spring Security + JWT o el IdP corporativo de Tenpo). Para este challenge se decidió **no implementar toda la capa de login/registro/refresh tokens** porque:

- Añadir usuarios, credenciales, flujo de login y manejo completo de JWT desplazaría el foco del ejercicio (transacciones, destinatarios, idempotencia, trazabilidad).
- La mayoría de la lógica de seguridad (gestión de identidades, revocación de tokens, permisos finos) pertenece a servicios de identidad compartidos a nivel empresa, no al microservicio de transacciones en sí.

En un siguiente paso, la aproximación natural sería:

- Integrar Spring Security con un filtro JWT que valide `Authorization: Bearer <token>` emitido por el IdP de Tenpo.
- Restringir el acceso a `/transaction/**` y `/recipient/**` a usuarios autenticados/rolados.
- Delegar la emisión/rotación de tokens a un servicio especializado, manteniendo este proyecto enfocado en reglas de negocio (idempotencia, consistencia, destinatarios y logging).

## Tests

- `mvn test` ejecuta tests unitarios (servicios con mocks, incluyendo `RecipientService` y manejo de `RecipientAlreadyExistsException`) e integración (POST con/sin idempotency key, misma key devuelve mismo ID, creación/listado de destinatarios).
- En entornos con JDK 21+ donde Mockito falla por *"Could not self-attach"*, se usa el mock maker **subclass** vía `src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker` (contenido: `mock-maker-subclass`).

## Estructura del proyecto

```
src/main/java/com/challenge/transaction/
├── TransactionApplication.java
├── config/
│   └── WebConfig.java
├── controller/
│   ├── TransactionController.java       (endpoints /transaction)
│   └── RecipientController.java         (endpoints /recipient)
├── dto/
│   ├── CreateTransactionRequest.java
│   └── CreateRecipientRequest.java
├── entity/
│   ├── Transaction.java                 (incluye @Version)
│   ├── Recipient.java
│   └── IdempotencyRecord.java
├── exception/
│   ├── GlobalExceptionHandler.java      (incluye OptimisticLockException → 409)
│   └── RecipientAlreadyExistsException.java
├── filter/
│   └── RequestIdFilter.java             (X-Request-ID en MDC y respuesta)
├── repository/
│   ├── TransactionRepository.java
│   ├── RecipientRepository.java
│   └── IdempotencyRepository.java
└── service/
    ├── TransactionService.java
    ├── RecipientService.java
    └── IdempotencyService.java
```

