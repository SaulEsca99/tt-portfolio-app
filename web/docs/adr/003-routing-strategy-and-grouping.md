# ADR-003: Estrategia de Enrutamiento y Agrupación de Rutas

Date: 2025-12-08
Status: Aceptado

## Contexto

Next.js 15 utiliza el App Router basado en sistema de archivos. Sin una estrategia clara, la carpeta `/app` puede volverse caótica. Necesitamos separar las rutas públicas, autenticadas y de administración, además de aislar la lógica de servidor de la UI.

## Decisión

Adoptamos una estrategia de **Route Groups** `(folder)` para organizar semánticamente la aplicación sin afectar la URL final.

### 1. Estructura de Grupos

- **`(routes)`**: Contenedor principal para todas las rutas navegables.
- **`(auth)`**: Rutas relacionadas con inicio de sesión y registro. (Layout dedicado a auth).
- **`(dashboard)`**: Rutas protegidas que requieren sesión activa. (Layout con Sidebar/Navbar de app).
- **`(home)`**: Landing page y páginas de marketing públicas. (Layout de marketing).

### 2. Responsabilidad de `page.tsx`

El archivo `page.tsx` actuará exclusivamente como un **Server Component Container**.

- **Responsabilidades:**
  - Validación de parámetros de URL (searchParams/params).
  - Verificación de permisos/sesión en el servidor.
  - Data Fetching (Prefetching) inicial.
  - Pasar datos limpios a una "Vista" (View Component).
- **Restricción:** No debe contener JSX complejo ni lógica de estado (hooks). Debe retornar un componente `View`.

## Consecuencias

- Mayor claridad en la separación de layouts.
- Testabilidad mejorada: La lógica de carga de datos se separa de la renderización.
- Los componentes de UI pueden ser reutilizados o cambiados sin tocar la lógica de data fetching.
