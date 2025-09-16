# Proyecto Socrates AI - Información Importante

## Credenciales y Servicios

### Supabase
- **Project ID**: mdbupwurfbqcxyuxcnum
- **URL**: https://mdbupwurfbqcxyuxcnum.supabase.co
- **Service Role Key**: Configurado en .env.local

### Usuario de Prueba (Development)
- **User ID**: df5cf0d5-c064-482c-87df-6100a8475a60
- **Email**: test@socrates.ai
- **Nombre**: Usuario de Prueba
- **Password**: test123456

### Zep AI
- **User ID**: francisco_orzabal
- **ProjectKey**: z_1dWlkIjoiMmE1ZGM4NTItYzdkNy00NDI1LWIxNTItYzYxMjYxMzNjYThjIn0.sacjlCZVoLOTR-Q4b03QFo8ID_ujRd7WggYdAe7CieoE3mnQM3isvKow90_5qYN8kCSF4Yi8LUOeOA-_fdV-fg

### Gemini AI
- **API Key**: AIzaSyCu_hgn92Ivbze84nKNin22OnrGdx4Z5S4 (Nueva - Funcionando)
- **Model**: gemini-1.5-flash (estable)

### Vercel
- **Access Token**: XMUCDtGkeSMIuJkne0AMBIaz
- **Project ID**: prj_9C1SHvN6O4t7PPNAuyHBgQhkvPex

### GitHub
- **Repository**: https://github.com/franorzabal-hub/socrates

## Tech Stack Actualizado (Sept 15, 2025)

### Versiones de Librerías
- **React Navigation**: v7 (native, drawer, stack)
- **React Native Reanimated**: v4.1.0
- **React Native Screens**: latest
- **Expo**: SDK 51
- **LangChain**: latest
- **Next.js**: 15.5.3

### Configuración Babel
```javascript
// apps/mobile/babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      'react-native-reanimated/plugin', // IMPORTANTE: Solo este, no worklets
    ],
  };
};
```

## Comandos Importantes

### Desarrollo Local
```bash
# Iniciar todos los servicios
npm run dev

# O individualmente:
cd apps/backend && npm run dev  # Puerto 3003
npx expo start --port 8082 -c   # Mobile con cache clear

# Actualizar librerías
npm update && npm install [package]@latest

# Limpiar cache de Expo
npx expo start -c
```

### URLs de Desarrollo
- **Backend API**: http://192.168.0.29:3003
- **Expo Mobile**: exp://192.168.0.29:8082
- **QR Code**: Abrir qr-code.html en navegador

## Estructura del Proyecto

```
socrates/
├── apps/
│   ├── mobile/          # React Native + Expo (iOS)
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   │   ├── AuthScreen.tsx
│   │   │   │   ├── ConversationsList.tsx
│   │   │   │   ├── ChatScreen.tsx
│   │   │   │   └── SettingsScreen.tsx
│   │   │   └── components/
│   │   │       └── DrawerContent.tsx
│   │   └── babel.config.js
│   └── backend/         # Next.js API Routes
│       └── src/
│           ├── app/api/
│           │   ├── auth/
│           │   ├── chat/
│           │   └── conversations/
│           └── lib/
│               └── zep.ts
├── packages/
│   ├── shared/          # Tipos compartidos
│   ├── database/        # Cliente y tipos de Supabase
│   └── ui/              # Componentes compartidos
├── supabase/
│   └── schema.sql       # Schema de base de datos
└── qr-code.html         # QR para Expo Go
```

## UI/UX - Estilo Claude Mobile

### Navegación
- **Drawer Lateral**: Implementado con React Navigation v7
- **DrawerContent**: Secciones organizadas (Nueva conversación, Conversaciones, Materias, etc.)
- **Header**: Menú hamburguesa + título + settings

### Pantallas
1. **AuthScreen**: Login con bypass rojo para desarrollo
2. **ConversationsList**: Lista de chats con preview y fecha
3. **ChatScreen**:
   - Estado vacío con "¿Cómo puedo ayudarte hoy?"
   - Ícono sparkles (naranja #FF5733)
   - Burbujas de chat diferenciadas
   - Input flotante con botón enviar
4. **SettingsScreen**: Configuración con switches y opciones

### Colores
- **Principal**: #007AFF (azul iOS)
- **Acento**: #FF5733 (naranja para elementos destacados)
- **Fondo**: #F7F7F7
- **Blanco**: #FFF
- **Texto**: #333

## API Endpoints

- `/api/auth` - Gestión de usuarios
- `/api/conversations` - CRUD de conversaciones
- `/api/conversations/[id]` - Detalle de conversación
- `/api/chat` - Chat con Gemini AI + Zep memoria
- `/api/health` - Health check

## Integración AI

### LangChain + Gemini
- System prompt configura tutor educativo en español
- Contexto de hasta 10 mensajes previos
- Respuestas guardadas en base de datos

### Zep AI (Memoria Persistente)
- Sesiones por usuario
- Memoria contextual entre conversaciones
- Enriquecimiento del prompt con contexto histórico

## Solución de Problemas Comunes

### Error: Worklets Failed to create
```bash
# Solución: Configurar babel.config.js correctamente
# Solo usar 'react-native-reanimated/plugin'
```

### Error: Duplicate plugin detected
```bash
# Solución: No usar 'react-native-worklets/plugin'
# Reanimated ya incluye worklets internamente
```

### Error: useLegacyImplementation prop
```bash
# Solución: Actualizar todas las librerías de navegación a v7
npm install @react-navigation/native@latest @react-navigation/drawer@latest
```

## Estado Actual (15 Sept 2025)
- ✅ App funcional con chat AI (Gemini 1.5 Flash)
- ✅ UI mejorada estilo Claude Mobile
- ✅ Navegación con Drawer lateral
- ✅ Zep AI integrado para memoria
- ✅ Todas las librerías actualizadas a latest
- ✅ Babel configurado correctamente
- ✅ Usuario de prueba configurado
- ✅ Base de datos conectada con RLS
- 📋 Pendiente: OAuth real, Android, Panel admin