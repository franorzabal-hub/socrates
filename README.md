# Socrates - AI Tutor PoC

AI tutor personalizado para estudiantes de primaria en Latinoamérica.

## Stack Tecnológico

- **Monorepo**: Turborepo
- **Mobile**: React Native + Expo (iOS)
- **Backend**: Next.js + Vercel
- **Database**: Supabase (Auth + PostgreSQL)
- **AI**: LangChain + Gemini 2.0 Flash + Zep AI

## Estructura del Proyecto

```
socrates/
├── apps/
│   ├── mobile/          # App móvil React Native + Expo
│   └── backend/         # API Next.js + Admin Panel
├── packages/
│   ├── shared/          # Tipos compartidos
│   ├── database/        # Cliente Supabase
│   └── ui/              # Componentes UI compartidos
└── turbo.json
```

## Setup Inicial

1. **Clonar el repositorio**
```bash
git clone [repo-url]
cd socrates
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. **Configurar Supabase**
- Crear proyecto en [Supabase](https://supabase.com)
- Ejecutar el schema SQL en `supabase/schema.sql`
- Copiar URL y ANON_KEY al `.env`

5. **Configurar autenticación**
- En Supabase Dashboard > Authentication > Providers
- Habilitar Google y Apple Sign-In
- Configurar OAuth credentials

## Desarrollo

```bash
# Ejecutar todo el monorepo
npm run dev

# Ejecutar solo el backend
npm run dev --filter=@socrates/backend

# Ejecutar solo la app móvil
npm run dev --filter=@socrates/mobile
```

## Scripts Disponibles

- `npm run dev` - Iniciar desarrollo
- `npm run build` - Build de producción
- `npm run lint` - Ejecutar linter
- `npm run type-check` - Verificar tipos

## Arquitectura

### Mobile App
- React Native con Expo
- Autenticación con Google/Apple via Supabase
- UI inspirada en Claude Mobile
- Chat en tiempo real con el tutor AI

### Backend API
- Next.js API Routes
- Integración con Gemini via LangChain
- Memoria conversacional con Zep AI
- Gestión de sesiones con Supabase

### Base de Datos
- PostgreSQL con Supabase
- Row Level Security (RLS)
- Tablas: users, conversations, messages
- Real-time subscriptions

## Próximos Pasos

1. Implementar UI del chat
2. Integrar LangChain + Gemini
3. Configurar Zep AI para memoria
4. Implementar autenticación OAuth
5. Testing end-to-end