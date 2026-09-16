# ADR-008: Gestión de Estado de Formularios en Cliente

**Fecha**: 2025-12-13
**Estado**: Aceptado

## Contexto

El proyecto "Medicamentos PS" requiere la implementación de múltiples flujos de entrada de datos, desde formularios simples (Login, Registro) hasta complejos (Publicación de Inventario, Solicitudes con lógica condicional).

El manejo manual del estado de los formularios (`useState`) escala mal y provoca código difícil de mantener ("Spaghetti Code"). Necesitamos una librería que gestione:

1.  **Estado del formulario:** Valores, errores, estado de "touched" y "dirty".
2.  **Validación:** Integración robusta con esquemas de validación existentes (Zod).
3.  **Seguridad de Tipos:** Garantía absoluta de que los datos del formulario coinciden con los DTOs esperados por el Backend/Server Actions.
4.  **Arquitectura Headless:** Capacidad de integrarse con nuestra biblioteca de componentes UI (Shadcn/Radix) sin imponer estructura HTML.

## Opciones Consideradas

1.  **React Hook Form (RHF)**: El estándar actual de la industria. Excelente rendimiento y gran comunidad. Sin embargo, su tipado en estructuras profundamente anidadas a veces requiere "casting" manual y su integración con componentes controlados (Shadcn) requiere el uso extensivo de `Controller`, lo que añade boilerplate.
2.  **TanStack Form**: Solución moderna y "Headless" del ecosistema TanStack. Diseñada con una filosofía "TypeScript-First" agresiva.
3.  **Formik**: Librería veterana, pero actualmente considerada en modo de mantenimiento con menor rendimiento y peor inferencia de tipos que las opciones modernas.
4.  **Native `useActionState` (React 19/Next.js)**: Ideal para formularios que funcionan sin JS, pero carece de la experiencia de usuario rica (validación en tiempo real, campos dependientes) que requiere nuestra aplicación interactiva.

## Decisión

Elegimos **TanStack Form**.

## Justificación

Elegimos TanStack Form sobre React Hook Form principalmente por su superioridad en la inferencia de tipos y su filosofía de diseño:

- **Seguridad de Tipos Profunda (Deep Type Safety):** TanStack Form infiere los tipos de los campos basándose en el validador (Zod) o el objeto inicial con una precisión superior, eliminando la necesidad de interfaces manuales duplicadas.
- **Arquitectura 100% Headless:** Nos da control total sobre el renderizado, lo que facilita enormemente la creación de componentes reutilizables (`<FormInput />`, `<FormSelect />`) que envuelven nuestros componentes de Shadcn UI sin pelear con el DOM.
- **Validación Agnostica:** Su arquitectura de adaptadores ( `validatorAdapter: zodValidator()`) encaja naturalmente con nuestra decisión previa de usar Zod para validaciones compartidas (Shared Kernel).
- **Ecosistema Unificado:** Se integra conceptual y técnicamente con TanStack Query (que usaremos para el manejo de estado de servidor), compartiendo patrones de diseño similares.

## Consecuencias

### Positivas

- **Reducción de Errores en Runtime:** El compilador de TypeScript detectará si intentamos acceder a un campo del formulario que no existe o tiene el tipo incorrecto.
- **Componentes Reutilizables Limpios:** Facilita la creación de una capa de abstracción de formularios (`src/client/components/form/*`) consistente.
- **Validación Síncrona y Asíncrona:** Manejo nativo y sencillo de validaciones complejas (ej. verificar si un email ya existe mientras el usuario escribe).

### Negativas

- **Comunidad más pequeña:** Al ser más nueva que React Hook Form, hay menos respuestas en StackOverflow o ejemplos en internet.
- **Curva de Aprendizaje:** Requiere entender el concepto de "Field API" y render props, lo cual puede ser ligeramente más verborrágico al inicio que los hooks simples.

## Referencias

- [TanStack Form Documentation](https://tanstack.com/form/latest)
- [Comparison: React Hook Form vs TanStack Form](https://tanstack.com/form/latest/docs/comparison)
