# ADR-001: Usar Next.js como Fullstack Framework con Separación Hexagonal

**Fecha**: 2025-12-05
**Estado**: Aceptado

## Contexto

El proyecto "Aplicación Medicamentos PS" requiere el desarrollo de una plataforma web para conectar donadores y receptores. El sistema tiene requerimientos funcionales que abarcan desde la gestión de inventario público (SEO relevante) hasta la generación de documentos legales (PDFs) y chat en tiempo real.

Nos enfrentamos a las siguientes restricciones y necesidades:

1.  **Velocidad de Desarrollo:** Necesitamos un MVP funcional rápidamente para validar el flujo de negocio (Fases 1-6).
2.  **SEO:** Los medicamentos publicados deben ser indexables por buscadores, lo que requiere Server-Side Rendering (SSR).
3.  **Mantenibilidad a Largo Plazo:** Existe la posibilidad explícita de que la lógica del servidor deba migrar a una arquitectura dedicada (Node.js/Express o NestJS) en el futuro.
4.  **Complejidad de Gestión:** Queremos evitar la sobrecarga operativa de gestionar dos repositorios y dos despliegues separados (Frontend + Backend) en la etapa inicial.

## Opciones Consideradas

### 1. Frontend (Vite/React) + Backend Dedicado (NestJS/Express)

- _Pros:_ Separación física total de responsabilidades. El backend es agnóstico desde el día 1.
- _Contras:_ Duplicación de DTOs y tipos. Doble pipeline de CI/CD. Mayor complejidad de infraestructura inicial. No resuelve el SEO del frontend nativamente sin configuración compleja.

### 2. Next.js "Standard" (Mezclado)

- _Pros:_ Desarrollo extremadamente rápido.
- _Contras:_ Alto acoplamiento. La lógica de negocio tiende a vivirse dentro de las `API Routes` o `Server Actions`, atando el dominio a objetos específicos de Next.js (`NextRequest`, `headers`). Migrar esto en el futuro requeriría una reescritura casi total.

### 3. Next.js como Monolito Modular (Elegida)

- _Descripción:_ Usar Next.js para servir tanto el front como el back, pero imponiendo una **Separación Estricta de Directorios** (`src/client` vs `src/server`) y prohibiendo que la lógica de negocio dependa del framework.
- _Pros:_ Un solo despliegue, tipos compartidos, SSR nativo. Permite "expulsar" el backend a Express en el futuro copiando la carpeta `src/server`.

## Decisión

Elegimos la **Opción 3: Next.js como Monolito Modular**.

Utilizaremos **Next.js 15 (App Router)** como el framework unificado, pero implementaremos una arquitectura interna que simula una separación cliente-servidor física.

## Justificación

Elegimos esta opción porque ofrece el mejor equilibrio entre velocidad inicial y escalabilidad futura:

1.  **Prevención de Vendor Lock-in (Regla de Dependencia):** Al forzar que los servicios de dominio en `src/server/modules` sean funciones de TypeScript puro (sin importar nada de `next/*`), garantizamos que la lógica de negocio ("Generar Orden", "Validar Caducidad") sea portable a cualquier otro runtime de Node.js sin cambios de código.
2.  **Optimización SEO:** Next.js maneja el SSR necesario para las fichas públicas de medicamentos sin configuración extra.
3.  **Type Safety Unificado:** Al estar en un monorepo, el Cliente y el Servidor comparten las mismas definiciones de tipos (Zod Schemas) en `src/shared`, eliminando errores de sincronización de contratos API.
4.  **Infraestructura Simplificada:** Despliegue atómico. No necesitamos coordinar versiones entre un front y un back separados.

## Consecuencias

### Positivas

- **Developer Experience (DX):** Navegación de código fluida. Un cambio en el esquema de base de datos se refleja inmediatamente en los tipos del frontend.
- **Portabilidad:** La carpeta `src/server` es, efectivamente, una aplicación Node.js independiente que vive "de alquiler" dentro de Next.js.
- **Claridad Arquitectónica:** La estructura de carpetas (`Identity`, `Inventory`, `Resolution`) comunica inmediatamente las capacidades del negocio ("Screaming Architecture").

### Negativas / Riesgos

- **Disciplina Requerida:** Se requiere una disciplina estricta (o reglas de linter personalizadas) para no importar componentes de React en el servidor o viceversa.
- **Bundle Size:** Si no se usan correctamente las barreras de importación (`server-only`), código de servidor podría filtrarse al bundle del cliente.
- **Cold Starts:** Si se despliega en Serverless (Vercel), las funciones de generación de PDF podrían sufrir latencia en arranque en frío.

## Referencias

- _Scope Rule & Screaming Architecture Guidelines_ (Definidas en ARCHITECTURE.md).
- Documento de Requerimientos "Aplicacion Medicamentos PS" (Fases 1-6 y RF1-RF37).
