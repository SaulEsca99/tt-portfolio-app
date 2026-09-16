# ADR-002: Use shadcn/ui for User Interface Components

**Fecha**: 2025-12-05
**Estado**: Aceptado

## Contexto

El proyecto "Aplicación Medicamentos PS" requiere una interfaz de usuario moderna, accesible y responsiva para facilitar el flujo de donaciones (Fases 1-6).

Necesitamos un sistema de diseño que cumpla con los siguientes requisitos:

1.  **Velocidad de desarrollo:** Necesitamos componentes complejos (Modales, DatePickers, Tablas) listos para usar en el MVP.
2.  **Accesibilidad:** Dado que es una plataforma de impacto social, los componentes deben ser accesibles (WAI-ARIA compliant) por defecto.
3.  **Control Total (Ownership):** Queremos evitar el "Vendor Lock-in" de librerías gigantes y opacas (caja negra) que dificultan la personalización profunda o el "Code Splitting".
4.  **Integración con Arquitectura Modular:** Los componentes base deben vivir en la capa compartida (`src/client/components/ui`) y ser fácilmente consumibles por los distintos Módulos Funcionales.

## Opciones Consideradas

### 1. Material UI (MUI)

- _Pros:_ Ecosistema masivo, componentes para todo.
- _Contras:_ Pesado (Bundle size). Estilos CSS-in-JS que a veces conflictúan con Server Components. Difícil de personalizar fuera de su sistema de "Theming". Es una "caja negra".

### 2. Tailwind CSS "Puro" (Sin librería base)

- _Pros:_ Control absoluto, cero dependencias extra, bundle mínimo.
- _Contras:_ Velocidad de desarrollo lenta. Tendríamos que construir desde cero componentes complejos como `Dialog`, `Popover` o `Combobox`, manejando nosotros mismos los estados de foco, cierre con 'Esc', etc.

### 3. shadcn/ui (Elegida)

- _Descripción:_ Colección de componentes reutilizables construidos con Radix UI y Tailwind CSS. No es una dependencia de NPM; el código se copia y pega en nuestro proyecto.
- _Pros:_ Código fuente accesible, accesibilidad garantizada (vía Radix), estilizado con Tailwind, fácil de modificar.

## Decisión

Elegimos **Opción 3: shadcn/ui**.

Implementaremos `shadcn/ui` como base de nuestro Design System, copiando el código de los componentes en el directorio `src/client/components/ui`.

## Justificación

Elegimos esta opción porque se alinea filosóficamente con nuestra arquitectura de "Ownership":

- **Arquitectura de Posesión:** A diferencia de instalar una librería externa, con shadcn el código de los componentes vive en nuestro repositorio. Si necesitamos modificar el comportamiento de un `Button` o un `Input` para una regla de negocio específica, tenemos control total del archivo `button.tsx`.
- **Compatibilidad con Server Components:** Al estar basado en primitivas estándar y CSS (Tailwind), funciona nativamente con Next.js App Router.
- **Patrón Presentational:** Los componentes de shadcn son "Presentational" puros. Se integran perfectamente dentro de nuestros "Containers" de módulo sin arrastrar lógica de estado compleja.
- **Consistencia:** Provee una estética profesional inmediata para formularios y dashboards (críticos para los módulos `Inventory` y `Governance`).

## Consecuencias

### Positivas

- **Iteración Rápida:** Podemos ensamblar interfaces complejas (ej. el Dashboard de Donaciones) en minutos usando bloques pre-construidos.
- **Bundle Size Optimizado:** Solo incluimos el código de los componentes que realmente usamos.
- **Personalización:** Podemos adaptar el diseño visual (Border radius, colores) modificando solo el archivo `tailwind.config.ts` y las variables CSS globales, sin luchar contra selectores de especificidad complejos.

### Negativas

- **Mantenimiento Manual:** Dado que "poseemos" el código, somos responsables de actualizarlo. Si shadcn/ui lanza una corrección de bugs en el componente `Tabs`, debemos copiar manualmente la actualización a nuestro archivo local.
- **Curva de Aprendizaje Radix:** Para personalizaciones avanzadas de comportamiento, los desarrolladores deben entender cómo funciona Radix UI (la librería "headless" subyacente).

## Referencias

- [Documentación Oficial de shadcn/ui](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- ADR-001 (Arquitectura Next.js)
