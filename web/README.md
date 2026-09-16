<div align="center">
  <img src="./docs/logo-main.webp" alt="DonaMed Logo" width="200">
  
  # DonaMed
  
  ### Plataforma de Donación de Medicamentos
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
  
  **Conectando donadores y receptores de medicamentos de forma segura y trazable**
  
  [🌐 Demo en Vivo](https://donamed-ten.vercel.app) • [📖 Documentación](./docs/ARCHITECTURE.md)
</div>

---

## 🎯 Sobre el Proyecto

**DonaMed** es una plataforma web que facilita la donación de medicamentos entre personas que tienen medicamentos sin usar y aquellas que los necesitan. El sistema garantiza seguridad, trazabilidad y transparencia en cada donación.

### ✨ Características Principales

- 📦 **Publicación de Medicamentos** - Los donadores pueden publicar medicamentos disponibles con validación de caducidad
- 🔍 **Búsqueda Inteligente** - Sistema de búsqueda y filtrado avanzado de medicamentos
- 🤝 **Matching Automático** - Algoritmo de emparejamiento entre donadores y receptores
- 📊 **Panel Administrativo** - Dashboard completo con métricas, gestión de usuarios y moderación
- 👥 **Gestión de Perfiles** - Perfiles diferenciados para donadores y receptores
- 📋 **Seguimiento de Solicitudes** - Sistema completo de solicitudes con estados y priorización
- 💬 **Coordinación** - Herramientas para coordinar la entrega de medicamentos
- 🔒 **Seguridad** - Autenticación robusta y validación de usuarios

---

## 🛠 Stack Tecnológico

### Frontend
- **Next.js 16** - Framework React con App Router
- **React 19.2** - Biblioteca de UI
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 4** - Framework de estilos
- **shadcn/ui** - Componentes UI basados en Radix UI
- **TanStack Query** - Gestión de estado del servidor
- **Recharts** - Visualización de datos

### Backend
- **PostgreSQL** - Base de datos relacional
- **Drizzle ORM** - ORM type-safe para TypeScript
- **Better Auth** - Sistema de autenticación
- **Zod** - Validación de esquemas
- **ImageKit** - Gestión y optimización de imágenes

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 20+
- pnpm 8+
- Docker (para PostgreSQL)

### Pasos de Instalación

```bash
# Clonar el repositorio
git clone https://github.com/SaulEsca99/Donamed.git
cd Donamed

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Levantar base de datos
docker-compose up -d

# Aplicar schemas de base de datos
pnpm run db:push

# (Opcional) Poblar con datos de prueba
pnpm run db:seed

# Iniciar servidor de desarrollo
pnpm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Servidor de desarrollo
pnpm build            # Build de producción
pnpm start            # Servidor de producción
pnpm lint             # Ejecutar ESLint

# Base de Datos
pnpm db:generate      # Generar migraciones
pnpm db:migrate       # Ejecutar migraciones
pnpm db:push          # Push schema a DB (desarrollo)
pnpm db:seed          # Poblar DB con datos de prueba
pnpm db:studio        # Abrir Drizzle Studio
```

---

## 🏗 Arquitectura

El proyecto sigue una **arquitectura hexagonal** (Ports & Adapters) con separación estricta entre capas:

```
src/
├── app/                    # Next.js App Router (Presentation)
├── client/                 # UI Components & Modules
│   ├── components/         # Componentes reutilizables
│   └── modules/            # Módulos por dominio
│       ├── feed/           # Feed de medicamentos
│       ├── identity/       # Autenticación y perfiles
│       ├── inventory/      # Gestión de inventario
│       ├── matchmaking/    # Solicitudes y matching
│       └── governance/     # Panel administrativo
├── server/                 # Business Logic & Services
│   ├── db/                 # Drizzle ORM
│   └── modules/            # Servicios por dominio
└── shared/                 # Tipos compartidos
```

### Módulos del Sistema

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| **Identity** | Autenticación y gestión de perfiles | ✅ Implementado |
| **Inventory** | Catálogo y publicación de medicamentos | ✅ Implementado |
| **Matchmaking** | Sistema de solicitudes y matching | ✅ Implementado |
| **Governance** | Panel administrativo y moderación | ✅ Implementado |
| **Coordination** | Chat y coordinación logística | 🚧 En desarrollo |
| **Resolution** | Evidencia digital y firmas | 📋 Planeado |

📚 **Documentación completa**: [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Este proyecto sigue [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
tipo(scope): descripción

# Ejemplos
feat(identity): add user registration
fix(inventory): correct medication validation
docs(readme): update installation guide
```

### Workflow

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feat/amazing-feature`)
3. Commit tus cambios (`git commit -m 'feat(module): add amazing feature'`)
4. Push a la rama (`git push origin feat/amazing-feature`)
5. Abre un Pull Request

---

## 👥 Equipo de Desarrollo

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/JavierVargasIPN2018">
        <img src="https://github.com/JavierVargasIPN2018.png" width="80px;" alt="Javier Vargas"/>
        <br />
        <sub><b>Javier Vargas</b></sub>
      </a>
      <br />
      <sub>Backend Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/SaulEsca99">
        <img src="https://github.com/SaulEsca99.png" width="80px;" alt="Saúl Escalante"/>
        <br />
        <sub><b>Saúl Escalante</b></sub>
      </a>
      <br />
      <sub>Fullstack Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/EdwinUrielAstudillo">
        <img src="https://github.com/EdwinUrielAstudillo.png" width="80px;" alt="Edwin Astudillo"/>
        <br />
        <sub><b>Edwin Astudillo</b></sub>
      </a>
      <br />
      <sub>Frontend Developer</sub>
    </td>
  </tr>
</table>

---

## 📄 Licencia

Este proyecto es parte de un proyecto académico.

---

## 📚 Recursos

- [Documentación de Arquitectura](./docs/ARCHITECTURE.md)
- [Análisis del Proyecto](./docs/ANALISIS_PROYECTO.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui](https://ui.shadcn.com/)

---

<div align="center">
  
**Desarrollado con ❤️ por el equipo de DonaMed**

[⬆ Volver arriba](#donamed)

</div>
