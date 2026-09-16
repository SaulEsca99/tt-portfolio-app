# ADR-007: Adopción de Better Auth para Autenticación

**Fecha**: 2025-12-13  
**Estado**: Aceptado

## Contexto

El sistema DONAMED requiere un sistema de autenticación robusto que soporte:

1. **Roles diferenciados**: Donador, Receptor/Beneficiario, y Administrador
2. **Validación de identidad**: Verificación de matrícula médica para donadores médicos
3. **Seguridad**: Contraseñas seguras, protección contra ataques
4. **Escalabilidad**: Soporte para múltiples métodos de autenticación (email/password, OAuth, 2FA)
5. **Type Safety**: Integración type-safe con TypeScript y Next.js 16

## Opciones Consideradas

1. **Better Auth**: Librería moderna TypeScript-first con soporte nativo para Next.js 16 y Drizzle ORM
2. **NextAuth.js (Auth.js v5)**: Solución popular con amplio ecosistema de providers
3. **Clerk**: Servicio SaaS completo con UI pre-construida
4. **Lucia Auth**: Librería minimalista y flexible
5. **Implementación custom**: Construir desde cero con bcrypt + JWT

## Decisión

Elegimos **Better Auth**.

## Justificación

Better Auth se alinea perfectamente con nuestro stack técnico y requerimientos:

### ✅ Ventajas Clave

1. **Integración Nativa con Drizzle ORM**
   - Better Auth tiene soporte first-class para Drizzle
   - Usa las mismas tablas que ya definimos en nuestro schema
   - No requiere un schema separado o duplicado

2. **TypeScript-First**
   - Type-safety completa en toda la API
   - Autocompletado en IDE para todos los métodos
   - Detección de errores en tiempo de compilación

3. **Next.js 16 Compatible**
   - Soporte nativo para Server Actions
   - Compatible con React Server Components
   - Optimizado para App Router

4. **Plugin Ecosystem**
   - 2FA out-of-the-box
   - Magic links
   - OAuth providers (Google, GitHub, etc.)
   - Passkeys/WebAuthn
   - Rate limiting integrado

5. **Flexibilidad para Roles Custom**
   - Permite extender el schema de usuarios fácilmente
   - Soporte para roles y permisos personalizados
   - Ideal para nuestro caso (Donador/Receptor/Admin)

6. **Performance**
   - Sin overhead de servicios externos (como Clerk)
   - Optimizado para serverless
   - Session management eficiente

### 📊 Comparación con Alternativas

| Característica | Better Auth | NextAuth.js | Clerk | Lucia |
|----------------|-------------|-------------|-------|-------|
| **Drizzle Integration** | ✅ Nativa | ⚠️ Adaptadores | ❌ No | ⚠️ Manual |
| **Type Safety** | ✅ Total | ⚠️ Parcial | ✅ Total | ✅ Total |
| **Next.js 16** | ✅ Nativo | ✅ Sí | ✅ Sí | ✅ Sí |
| **Costo** | ✅ Gratis | ✅ Gratis | ❌ Paid | ✅ Gratis |
| **2FA Built-in** | ✅ Sí | ❌ No | ✅ Sí | ❌ No |
| **Self-hosted** | ✅ Sí | ✅ Sí | ❌ SaaS | ✅ Sí |
| **Curva Aprendizaje** | 🟢 Baja | 🟡 Media | 🟢 Baja | 🟡 Media |

### 🎯 Casos de Uso en DONAMED

Better Auth cubre todos nuestros requerimientos funcionales:

- **RF1 (Registro)**: API simple para crear usuarios con roles
- **RF2 (Validación)**: Validación de email, contraseña segura integrada
- **RF3 (Autenticación)**: Login/logout con sessions
- **RF4 (Perfiles)**: Extensión fácil del schema para perfiles
- **RF5 (Roles)**: Middleware para restricción por rol

## Consecuencias

### Positivas

- ✅ Desarrollo más rápido (menos código boilerplate)
- ✅ Seguridad robusta out-of-the-box
- ✅ Fácil agregar OAuth providers en el futuro
- ✅ Type-safety en toda la capa de autenticación
- ✅ Sin vendor lock-in (self-hosted)

### Negativas

- ⚠️ Ecosistema más joven que NextAuth (menos recursos comunitarios)
- ⚠️ Documentación en evolución (aunque ya es bastante completa)
- ⚠️ Menos ejemplos de implementación disponibles

### Mitigaciones

- Documentar bien nuestra implementación
- Contribuir a la comunidad si encontramos issues
- Mantener abstracción en caso de necesitar migrar (poco probable)

## Implementación

### Instalación

```bash
pnpm add better-auth
```

### Configuración Básica

```typescript
// src/server/auth/index.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
  },
});
```

### Extensión para Roles

```typescript
// src/server/auth/schema.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified"),
  role: text("role", { enum: ["donor", "recipient", "admin"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

## Referencias

- [Better Auth Documentation](https://better-auth.com/)
- [Better Auth + Drizzle Guide](https://better-auth.com/docs/integrations/drizzle)
- [Better Auth vs NextAuth Comparison](https://betterstack.com/community/comparisons/nextauth-vs-better-auth/)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
