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