# ADR-005: Adopción de Drizzle como ORM

**Fecha**: 2025-12-08
**Estado**: Aceptado

## Contexto

Para interactuar con nuestra base de datos PostgreSQL desde una aplicación Next.js (que utiliza Server Components y posiblemente Serverless Functions), necesitamos una capa de abstracción de base de datos.

Las restricciones técnicas son:

1. **Seguridad de Tipos (Type Safety):** Queremos detectar errores de consulta en tiempo de compilación, no en tiempo de ejecución.
2. **Rendimiento en "Cold Start":** Next.js en entornos serverless sufre si la librería de base de datos es muy pesada al iniciar.
3. **Productividad:** Necesitamos gestionar migraciones de esquema y relaciones de forma sencilla.

## Opciones Consideradas

1. **Drizzle ORM**: ORM moderno enfocado en ser ligero ("TypeScript-first") y similar a SQL.
2. **Prisma**: El ORM más popular en el ecosistema Node.js. Excelente experiencia de desarrollador (DX) pero conocido por tener un "runtime" pesado (binario de Rust) que afecta los tiempos de arranque en serverless.
3. **TypeORM**: Solución madura basada en decoradores/clases. Menor inferencia de tipos automática y patrón Active Record que puede ser menos performante.
4. **Raw SQL (`pg` driver)**: Máximo rendimiento, pero nula seguridad de tipos y alta complejidad de mantenimiento.

## Decisión

Elegimos **Drizzle ORM**.

## Justificación

Drizzle ORM se alinea perfectamente con la filosofía de Next.js moderno:

- **Rendimiento Serverless:** Drizzle tiene un costo de inicio casi nulo porque no depende de un binario pesado en tiempo de ejecución, a diferencia de Prisma. Esto reduce la latencia de nuestras Server Actions y APIs.
- **"If you know SQL, you know Drizzle":** Su API está diseñada para parecerse a SQL, lo que reduce la curva de aprendizaje y evita la "caja negra" donde el desarrollador no sabe qué query se está ejecutando realmente.
- **Inferencia de Tipos:** Ofrece una seguridad de tipos superior al inferir los tipos directamente de los esquemas de la base de datos, sin necesidad de pasos de generación de código constantes.
- **Drizzle Kit:** Provee una herramienta robusta para gestionar migraciones de esquema y prototipado rápido (Drizzle Studio).

## Consecuencias

### Positivas

- Tiempos de respuesta más rápidos en la aplicación (menor latencia).
- Bundle size (tamaño final de la app) significativamente menor.
- Control total sobre las consultas SQL generadas.

### Negativas

- Ecosistema más joven que Prisma, por lo que puede haber menos recursos comunitarios o plugins de terceros.
- Requiere definir las relaciones explícitamente en las consultas (no hay "carga perezosa" automática), lo cual es bueno para performance pero requiere más código explícito.

## Referencias

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle vs Prisma: the Better TypeScript ORM in 2025](https://www.bytebase.com/blog/drizzle-vs-prisma/)
- [How I migrated from Prisma to DrizzleORM with absolutely no hassle and zero downtime](https://medium.com/drizzle-stories/how-i-migrated-from-prisma-to-drizzleorm-with-absolutely-no-hassle-and-zero-downtime-9f5f0881fc04)
