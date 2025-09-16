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

### ✅ Recientemente Completado
1. **Autenticación y Usuarios**
   - Modo desarrollo implementado (bypass auth para testing)
   - Usuario de prueba creado en Supabase
   - Auth flow completo configurado
   - ID fijo de usuario: df5cf0d5-c064-482c-87df-6100a8475a60

2. **UI Mobile Completa**
   - AuthScreen con botón de desarrollo
   - ConversationsList (pantalla principal)
   - ChatScreen con UI estilo Claude
   - Navegación funcional entre pantallas
   - Estilos y animaciones implementados

3. **API Endpoints**
   - `/api/auth` - Gestión de usuarios
   - `/api/conversations` - CRUD de conversaciones
   - `/api/conversations/[id]` - Detalle de conversación
   - `/api/chat` - Integración con Gemini AI
   - `/api/health` - Health check endpoint

4. **Integración con AI**
   - LangChain + Gemini 2.0 Flash configurado
   - System prompt personalizado para tutor educativo
   - Respuestas en español para estudiantes
   - Manejo de contexto de conversación

5. **Desarrollo Local**
   - Servidores funcionando en paralelo
   - Backend: http://192.168.0.29:3003
   - Expo: exp://192.168.0.29:8082
   - QR code HTML para testing con Expo Go

### ✅ Completado (15 de Septiembre 2025)

1. **Integración con Zep AI (FUNCIONANDO)**
   - Librería Zep Cloud instalada y configurada
   - API Key actualizada y funcional
   - Módulo de memoria persistente implementado (`/lib/zep.ts`)
   - Chat route actualizado para usar memoria contextual
   - Sesiones de usuario creándose correctamente con userId
   - Persistencia de mensajes en memoria (user y assistant)
   - Context retrieval funcionando - el AI recuerda conversaciones anteriores
   - Logs confirmando: "Zep session initialized", "Added to Zep memory", "Using Zep memory context"

2. **Fix de Gemini API**
   - Nueva API key configurada y funcionando
   - Modelo actualizado a gemini-2.0-flash-exp (última versión)
   - Respuestas del tutor AI funcionando correctamente
   - Integración con LangChain estable

3. **UI/UX Mejorado - Estilo Claude Mobile**
   - Navegación con Drawer lateral implementada
   - Pantalla de Settings completa con switches y opciones
   - Chat mejorado con mensaje de bienvenida ("¿Cómo puedo ayudarte hoy?")
   - Ícono de sparkles para estado vacío
   - Header unificado con menú hamburguesa
   - DrawerContent con secciones organizadas

4. **Actualización de Librerías**
   - Todas las librerías actualizadas a las últimas versiones
   - React Navigation v7 (native, drawer, stack)
   - React Native Reanimated v4.1.0
   - Babel configurado correctamente con plugins necesarios
   - Resueltos conflictos de versiones entre dependencias

5. **Configuración de Desarrollo**
   - Babel.config.js creado con configuración correcta
   - Variables de entorno funcionando
   - Servidores corriendo en paralelo (Backend y Mobile)
   - QR code HTML para testing con Expo Go

### 🚀 Estado Actual del PoC
- **Frontend Mobile**: Funcionando con UI mejorada estilo Claude
- **Backend API**: Operativo con todas las rutas funcionando
- **Base de Datos**: Supabase configurado con RLS policies
- **AI Integration**: Gemini + LangChain + Zep funcionando
- **Usuario de Prueba**: df5cf0d5-c064-482c-87df-6100a8475a60

### ✅ Testing Validado (16 de Septiembre 2025)

1. **End-to-End Testing Completo**
   - Autenticación funcionando (modo desarrollo)
   - Creación y gestión de conversaciones
   - Chat con AI respondiendo correctamente
   - Memoria persistente con Zep verificada
   - Renombrado de conversaciones
   - Historial de conversaciones
   - Todas las APIs respondiendo correctamente

### 📋 Pendiente
- Implementación real de Google/Apple OAuth (post-PoC)
- Despliegue a producción
- Android support
- Panel administrativo para colegios y padres

## URLs y Recursos

- **GitHub Repository**: https://github.com/franorzabal-hub/socrates
- **Vercel Project**: Desplegado automáticamente desde GitHub
- **Supabase Project**: mdbupwurfbqcxyuxcnum.supabase.co