# ADR-006: Manejo Tipado de Variables de Entorno

**Fecha**: 2025-12-08
**Estado**: Aceptado

## Contexto

El proyecto "Medicamentos PS" requiere la configuración de servicios críticos como PostgreSQL (via Drizzle). Actualmente, el uso nativo de `process.env` en Next.js presenta los siguientes riesgos:

1.  **Falta de Validación**: No hay garantía de que las variables requeridas (ej. `DATABASE_URL`) existan al iniciar la aplicación.
2.  **Tipado Débil**: TypeScript trata `process.env` como `string | undefined`, obligando a hacer validaciones manuales o "casting" inseguro en múltiples lugares del código.
3.  **Fuga de Secretos**: Es fácil exponer accidentalmente credenciales de servidor en el bundle del cliente si no se tiene cuidado con el prefijo `NEXT_PUBLIC_`.

Necesitamos un mecanismo robusto para validar, tipar y gestionar estas variables centralizadamente.

## Opciones Consideradas

1.  **Nativo (`process.env`)**:
    - Uso estándar de Next.js.
    - Requiere validación manual (`if (!process.env.DB_URL) throw...`) dispersa por el código.
2.  **`dotenv` + Validación manual**:
    - Carga variables, pero la validación sigue siendo manual o requiere scripts personalizados al inicio.
3.  **`@t3-oss/env-nextjs` + `zod`**:
    - Biblioteca estándar en el stack T3.
    - Utiliza esquemas de Zod para validar formatos (ej. asegurarse que una URL sea realmente una URL).
    - Separa explícitamente variables de `server` y `client`.

## Decisión

Elegimos **Opción 3: `@t3-oss/env-nextjs` y `zod`**.

## Justificación

Priorizamos la **seguridad de tipos** y el principio de **"Fail Fast"** (Fallar Rápido):

- **Validación en Build Time**: La aplicación fallará al intentar construirse (build) o iniciarse si faltan variables o tienen formato incorrecto, impidiendo despliegues rotos.
- **Intellisense y Autocompletado**: Al usar el objeto `env` exportado, los desarrolladores tienen autocompletado de las variables disponibles.
- **Seguridad**: La librería lanza un error si intentamos acceder a una variable de servidor desde un componente de cliente, previniendo fugas de seguridad.

## Consecuencias

### Positivas

- Garantía de que el entorno de ejecución es válido antes de arrancar.
- Centralización de toda la configuración del entorno en un solo archivo (`src/env.ts`).
- Mayor confianza al refactorizar o desplegar en nueva infraestructura.

### Negativas

- Agrega una dependencia de tiempo de ejecución pequeña.
- Requiere definir el esquema Zod cada vez que se agrega una nueva variable de entorno (paso extra, pero beneficioso).

## Referencias

- [Documentación oficial @t3-oss/env-nextjs](https://env.t3.gg/)
- [Zod Documentation](https://zod.dev/)
