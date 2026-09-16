# Arquitectura del Sistema: Medicamentos PS

Este documento define la arquitectura técnica y las reglas de diseño para la plataforma de donación de medicamentos.

## 🏗 Visión **General**

El proyecto sigue una arquitectura de **Monolito Modular** con una separación estricta entre **Cliente** (Frontend) y **Servidor** (Backend/Lógica de Negocio), alojados dentro del mismo repositorio (Monorepo conceptual).

El objetivo principal de esta arquitectura es la **Mantenibilidad** y la **Portabilidad**.

- **Screaming Architecture:** La estructura de carpetas grita "Salud y Donaciones", no "Componentes y Utils".
- **Future-Proof:** La lógica de servidor está desacoplada de Next.js, permitiendo una migración futura a Express/NestJS si fuera necesario.

## 📂 Estructura de Directorios

```bash
src/
├── app/                        # 🚀 FRAMEWORK (Next.js App Router)
│   ├── (routes)/               # Grupos de rutas (opcional)
│   ├── api/                    # Route Handlers (API Endpoints)
│   ├── layout.tsx              # Root Layout
│   └── page.tsx                # Entry point que importa la View desde 'client'
│
├── client/                     # 🎨 PRESENTATION (UI Library pura)
│   ├── components/             # UI Reutilizable (Botones, Cards - ShadcnUI)
│   ├── hooks/                  # Lógica de React global
│   └── modules/                # Vistas y Componentes por Dominio
│       └── [Modulo]/           # (ej. Inventory)
│           ├── components/     # UI específica del módulo
│           └── pages/          # **NUEVO**: El componente "Page" completo que exportas a /app
│
├── server/                     # 🧠 CORE (Backend & Business Logic)
│   ├── db/                     # Configuración Drizzle
│   └── modules/                # Lógica de Negocio
│       └── [Modulo]/
│           ├── *.service.ts    # Lógica pura
│           └── *.schema.ts     # Zod Schemas
│
└── shared/                     # 🤝 SHARED KERNEL
    └── types/                  # Tipos/DTOs compartidos
```

## 🌐 Contextos Delimitados (Bounded Contexts)

El sistema está dividido en 6 módulos funcionales autónomos. Cada módulo encapsula su propia lógica y datos.

| Módulo           | Responsabilidad                                                                  | Fase del Flujo |
| :--------------- | :------------------------------------------------------------------------------- | :------------- |
| **Identity**     | Gestión de acceso, registro, autenticación y perfiles (Donador/Receptor).        | Fase 1         |
| **Inventory**    | Catálogo de medicamentos. Publicación, validación de caducidad y búsqueda.       | Fase 2         |
| **Matchmaking**  | El "apretón de manos". Solicitudes, quiz de necesidad y selección del receptor.  | Fase 3 & 4     |
| **Coordination** | Chat temporal y acuerdo logístico (Lugar/Fecha). Efímero durante la transacción. | Fase 5         |
| **Resolution**   | Generación de evidencia (PDF), firmas digitales y cierre de donación.            | Fase 6         |
| **Governance**   | Panel administrativo para auditoría y resolución de disputas.                    | Transversal    |

---

## 📏 Reglas de Arquitectura (The Law)

### 1\. La Regla del Alcance (Scope Rule)

**"El alcance determina la ubicación"**

- **Código usado por 1 funcionalidad** → Se queda LOCAL en `client/modules/[Modulo]` o `server/modules/[Modulo]`.
- **Código usado por 2+ funcionalidades** → Se promueve a `shared/` o `client/components/`.
- **PROHIBIDO:** Importar código de un módulo hermano directamente. La comunicación debe ser a través de interfaces públicas o eventos.

### 2\. La Regla de Dependencia (Dependency Rule)

El flujo de dependencia es unidireccional:
`Client` -\> `Shared` \<- `Server`

- **El Server NO sabe que existe el Client.** No puede importar nada de `client/`.
- **El Server NO sabe que existe Next.js.** Los servicios (`*.service.ts`) no deben usar `NextRequest` o `NextResponse`. Deben retornar objetos planos o lanzar errores estándar.
- **El Client es "tonto".** No contiene reglas de negocio complejas (ej. validación de impuestos o lógica de caducidad crítica), solo validación de formularios y visualización.

### 3\. Patrón Container / Presentational (Frontend)

Para mantener el cliente organizado:

- **Containers (`*-container.tsx`):** Manejan el estado, `useQuery`, `useMutation` y pasan datos.
- **Presentational (`*-view.tsx` o componentes):** Solo reciben `props` y renderizan UI. No hacen llamadas a API.

---

## 🚀 Guía de Contribución

### Dónde crear un nuevo archivo

1.  **¿Es un componente visual (Botón, Input)?**
    - \-\> `src/client/components/ui`
2.  **¿Es una pantalla completa de una funcionalidad (ej. "Crear Donación")?**
    - \-\> `src/client/modules/Inventory/features/create-donation/`
3.  **¿Es una regla de negocio (ej. "No permitir donar si caduca en \< 30 días")?**
    - \-\> `src/server/modules/Inventory/inventory.service.ts`

### Nomenclatura

- **Directorios:** `kebab-case` (ej. `secure-chat`)
- **Componentes:** `PascalCase` (ej. `ChatContainer.tsx`)
- **Servicios/Funciones:** `camelCase` (ej. `createDonation`)
