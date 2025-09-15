# Tutor AI - Prueba de Concepto (PoC)

## Visión General
Aplicación de tutor AI personalizado para estudiantes de primaria en Latinoamérica.

## Arquitectura Técnica

### Stack Principal
- **Monorepo**: Turborepo
- **Mobile App**: React Native con Expo (iOS inicial)
- **Backend**: Next.js en Vercel (API Routes)
- **Database**: Supabase (Auth + PostgreSQL)
- **AI Stack**:
  - LangChain (orquestación)
  - Gemini 2.0 Flash (LLM principal para PoC - gratis)
  - Diseño LLM-agnóstico para futura flexibilidad
  - Zep AI (memoria conversacional persistente)

## Alcance Funcional del PoC

### Características Core
1. **Autenticación**
   - Login con Google
   - Login con Apple
   - Gestión de sesión via Supabase Auth

2. **Chat con Tutor AI**
   - Interfaz conversacional estilo Claude Mobile
   - Respuestas contextualizadas para estudiantes de primaria
   - Sin restricción temática inicial (definir después de validar base)

3. **Historial de Conversaciones**
   - Lista de chats previos
   - Persistencia de conversaciones
   - Capacidad de retomar conversaciones anteriores

4. **Memoria Contextual**
   - Personalización por estudiante usando Zep AI
   - Recordar contexto entre sesiones
   - Adaptación al progreso del estudiante

### UX/UI - Inspirado en Claude Mobile
- **Home Screen**: Lista de conversaciones (título + preview + timestamp)
- **Chat View**: Interfaz limpia con burbujas diferenciadas
- **Input Bar**: Flotante con botón de envío
- **Navigation**: Drawer/sidebar con historial
- **Diseño**: Minimalista, tipografía clara, espaciado generoso
- **Animaciones**: Sutiles al enviar/recibir mensajes

## Estructura del Proyecto

```
socrates/
├── apps/
│   ├── mobile/          # React Native + Expo app
│   └── backend/         # Next.js API + futuro admin panel
├── packages/
│   ├── shared/          # Tipos y utilidades compartidas
│   ├── ui/              # Componentes compartidos (si aplica)
│   └── database/        # Esquemas y tipos de Supabase
├── turbo.json
└── package.json
```

## Futuras Expansiones (Post-PoC)

### Panel Administrativo
- Para colegios (profesores, directivos)
- Para padres de familia
- Monitoreo de progreso
- Configuración de parámetros educativos

### Consideraciones para Producción
- Rate limiting
- Optimización de costos de API
- Selección dinámica de LLM según contexto
- Android support
- Métricas y analytics

## Decisiones Técnicas Clave

1. **Turborepo sobre npm workspaces**: Mayor robustez para crecimiento futuro
2. **Gemini 2.0 Flash para PoC**: Balance costo-calidad, gratis para validación
3. **LLM-agnóstico**: Flexibilidad para optimizar por costo/calidad/caso de uso
4. **Foco en experiencia estudiante primero**: Admin panel diferido
5. **iOS inicial**: Simplifica desarrollo y testing del PoC

## Objetivo del PoC
Validar la viabilidad técnica y la experiencia de usuario de un tutor AI personalizado, estableciendo una base sólida y escalable para futuras iteraciones del producto.

## Estado de Implementación

### ✅ Completado
1. **Infraestructura Base**
   - Monorepo con Turborepo configurado
   - Estructura de packages (shared, database, ui)
   - Git repository creado y vinculado a GitHub

2. **Backend Setup**
   - Next.js app configurado en `apps/backend`
   - Desplegado en Vercel (auto-deploy desde GitHub)
   - Variables de entorno configuradas en Vercel

3. **Mobile App Setup**
   - React Native + Expo configurado en `apps/mobile`
   - Dependencias base instaladas
   - Configuración de navegación y UI libraries

4. **Base de Datos**
   - Supabase proyecto creado y configurado
   - Schema SQL ejecutado (tablas: users, conversations, messages)
   - Row Level Security (RLS) policies implementadas
   - Triggers para updated_at configurados

5. **Configuración de Servicios**
   - Credenciales de Gemini AI configuradas
   - Credenciales de Zep AI configuradas
   - Variables de entorno local y producción

### 🚧 En Progreso
- Implementación de autenticación (Google/Apple login)
- Creación de chat UI estilo Claude
- Integración con LangChain y Gemini

### 📋 Pendiente
- API endpoints para manejo de mensajes
- Integración con Zep AI para memoria
- Testing end-to-end del flujo completo

## URLs y Recursos

- **GitHub Repository**: https://github.com/franorzabal-hub/socrates
- **Vercel Project**: Desplegado automáticamente desde GitHub
- **Supabase Project**: mdbupwurfbqcxyuxcnum.supabase.co