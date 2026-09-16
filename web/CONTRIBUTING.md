# Guía de Contribución - DonaMed

Bienvenido al equipo de DonaMed. Esta guía te ayudará a contribuir de manera efectiva.

## 🚀 Quick Start

### 1. Setup Local

```bash
# Clonar el repositorio
git clone https://github.com/JavierVargasIPN2018/donamed.git
cd donamed

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Levantar base de datos
docker-compose up -d

# Correr en desarrollo
pnpm run dev
```

### 2. Crear una Feature

```bash
# Actualizar master
git checkout master
git pull origin master

# Crear branch según tu rol
# Backend:
git checkout -b feat/[modulo]-[feature]-backend

# Frontend:
git checkout -b feat/[modulo]-[feature]-frontend

# Fullstack:
git checkout -b feat/[modulo]-[feature]-fullstack
```

### 3. Hacer Commits

Usamos **Conventional Commits**:

```bash
# Formato
tipo(scope): descripción corta

# Ejemplos
git commit -m "feat(identity): add user registration service"
git commit -m "fix(inventory): correct date validation"
git commit -m "chore(deps): update next to 16.0.7"
git commit -m "docs(readme): add setup instructions"
```

**Tipos permitidos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `chore`: Mantenimiento
- `docs`: Documentación
- `refactor`: Refactorización
- `test`: Tests
- `style`: Formato de código
- `perf`: Mejora de performance

### 4. Crear Pull Request

```bash
# Push de tu branch
git push origin feat/[modulo]-[feature]-[rol]

# Ir a GitHub y crear PR
# El template se llenará automáticamente
```

### 5. Code Review

- **Backend Dev**: Revisa PRs de backend
- **Frontend Dev**: Revisa PRs de frontend
- **Fullstack Dev**: Revisa todos los PRs (especialmente integraciones)

**Tiempo de respuesta esperado**: < 4 horas

### 6. Merge

Una vez aprobado el PR:
- El autor hace **Merge** (no Squash)
- Borrar la branch remota después del merge
- Actualizar tu master local

```bash
git checkout master
git pull origin master
git branch -d feat/[modulo]-[feature]-[rol]
```

## 📐 Arquitectura

Lee estos documentos **obligatoriamente**:
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Reglas de arquitectura
- [ANALISIS_PROYECTO.md](./docs/ANALISIS_PROYECTO.md) - Análisis completo

### Reglas de Oro

1. **Client NO importa de Server**
2. **Server NO importa de Client**
3. **Server NO usa Next.js** (solo objetos planos)
4. **Módulos NO se importan entre sí** (solo via shared/)

## 🌿 Estrategia de Branching: AgileFlow

Usamos una estrategia simplificada de **AgileFlow**:

- **`master`** es el trunk principal (siempre deployable)
- **Feature branches** de corta duración (2-3 días máximo)
- **PRs pequeños** y frecuentes (< 400 líneas)
- **Sincronización diaria** con master

### Nomenclatura de Branches

```
tipo/modulo-descripcion-rol
```

**Ejemplos:**
- `feat/identity-login-backend`
- `feat/inventory-list-frontend`
- `fix/matchmaking-validation-fullstack`
- `integration/identity-auth`

### Workflow Diario

```bash
# CADA MAÑANA
git checkout master
git pull origin master
git checkout tu-branch
git rebase master  # Si master avanzó
```

## 🧪 Testing (Próximamente)

```bash
# Correr tests
pnpm test

# Correr tests en watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## 🎨 Asignación por Rol

### Backend Developer
**Carpetas:**
- `src/server/modules/[Modulo]/*.service.ts`
- `src/server/db/schema.ts`
- `src/app/api/[endpoint]/route.ts`

**Responsabilidades:**
- Lógica de negocio
- Schemas de base de datos
- API endpoints
- Validaciones Zod

### Frontend Developer
**Carpetas:**
- `src/client/modules/[Modulo]/components/`
- `src/client/modules/[Modulo]/pages/`
- `src/app/(routes)/`

**Responsabilidades:**
- Componentes UI
- Páginas y vistas
- Integración con API
- Componentes shadcn/ui

### Fullstack Developer
**Carpetas:**
- Todas las anteriores

**Responsabilidades:**
- Code reviews
- Integración cliente-servidor
- Resolver conflictos
- Documentación

## 🚨 Troubleshooting

### Mi branch está desactualizado

```bash
git checkout master
git pull origin master
git checkout tu-branch
git rebase master
# Resolver conflictos si hay
git push origin tu-branch --force-with-lease
```

### Conflictos en package-lock.json

```bash
git checkout master -- package-lock.json
pnpm install
git add package-lock.json
git rebase --continue
```

### Pre-commit hook falla

```bash
# Correr manualmente
pnpm run lint
pnpm run build

# Si pasa, hacer commit de nuevo
git commit -m "tu mensaje"
```

## 📚 Recursos

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub CLI](https://cli.github.com/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [shadcn/ui Components](https://ui.shadcn.com/)

## 📞 Contacto

Si tienes dudas, pregunta en el canal del equipo.
