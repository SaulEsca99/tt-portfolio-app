# ADR-004: Selección de Motor de Base de Datos Relacional

**Fecha**: 2025-12-08
**Estado**: Aceptado

## Contexto

El proyecto "Medicamentos PS" requiere una persistencia de datos robusta para manejar entidades críticas como usuarios, inventarios de medicamentos y registros de transacciones/donaciones.

Necesitamos un motor de base de datos que garantice:

1. **Integridad de datos (ACID):** Crucial para evitar inconsistencias en el inventario.
2. **Escalabilidad:** Capacidad para crecer con el volumen de datos.
3. **Flexibilidad:** Capacidad de manejar estructuras de datos cambiantes o semi-estructuradas (metadata).
4. **Compatibilidad:** Integración nativa o sencilla con el ecosistema de Next.js y proveedores de hosting modernos (Vercel, Neon, Supabase).

## Opciones Consideradas

1. **PostgreSQL**: Base de datos relacional de código abierto avanzada, conocida por su fiabilidad y soporte de tipos complejos (JSONB).
2. **MySQL / MariaDB**: Opciones relacionales populares, pero con menor soporte de características avanzadas SQL y manejo de JSON comparado con Postgres.
3. **MongoDB**: Base de datos NoSQL orientada a documentos. Ofrece alta flexibilidad pero carece de garantías ACID estrictas por defecto y complejidad en relaciones complejas (joins).
4. **SQLite (LibSQL)**: Ligera y rápida, ideal para el borde (Edge), pero tradicionalmente difícil de escalar horizontalmente para escrituras concurrentes sin capas adicionales (como Turso).

## Decisión

Elegimos **PostgreSQL**.

## Justificación

Elegimos PostgreSQL por ser el estándar de facto en el desarrollo moderno de aplicaciones web empresariales debido a:

- **Robustez y ACID:** Garantiza que las transacciones de inventario sean atómicas y seguras.
- **Soporte JSONB:** Nos permite almacenar metadatos flexibles (ej. detalles específicos de un medicamento o logs de auditoría) sin perder la capacidad de indexar y consultar esos datos eficientemente.
- **Ecosistema Serverless:** Proveedores como Neon o Vercel Postgres han optimizado PostgreSQL para entornos Serverless (pool de conexiones, escalado a cero), lo cual se alinea con nuestra infraestructura en Next.js.
- **Extensibilidad:** Soporte para extensiones como `pgvector` (si a futuro implementamos búsqueda semántica con AI).

## Consecuencias

### Positivas

- Garantía de consistencia de datos desde el día uno.
- Amplio soporte de herramientas, clientes y ORMs.
- Facilidad para realizar consultas complejas y reportes analíticos.

### Negativas

- Requiere gestión de infraestructura (o costo de servicio gestionado) mayor que una solución basada en archivos como SQLite.
- Consumo de recursos ligeramente mayor que MySQL en configuraciones muy básicas.

## Referencias

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vercel Postgres Storage](https://vercel.com/docs/storage/vercel-postgres)
- [JSONB performance in PostgreSQL](https://www.citusdata.com/blog/2016/07/14/choosing-nosql-hstore-json-jsonb/)
