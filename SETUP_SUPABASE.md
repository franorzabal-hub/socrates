# Configuración de Supabase

## Paso 1: Ejecutar el Schema SQL

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard/project/mdbupwurfbqcxyuxcnum)
2. Ve a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega TODO el contenido del archivo `supabase/schema.sql`
5. Ejecuta el query (botón "Run")

## Paso 2: Configurar Authentication Providers

1. Ve a **Authentication** → **Providers**
2. Habilita **Google**:
   - Necesitarás crear un proyecto en Google Cloud Console
   - Obtener Client ID y Client Secret
   - Configurar redirect URL: `https://mdbupwurfbqcxyuxcnum.supabase.co/auth/v1/callback`
3. Habilita **Apple** (opcional para PoC):
   - Requiere cuenta de Apple Developer
   - Configurar Service ID y keys

## Verificación

Para verificar que todo está configurado correctamente:

1. Ve a **Table Editor**
2. Deberías ver las siguientes tablas:
   - `users`
   - `conversations`
   - `messages`

## Variables de Entorno

Ya están configuradas en:
- **Local**: `.env.local`
- **Vercel**: Configuradas via CLI ✅

## URL del proyecto

- **Supabase Dashboard**: https://supabase.com/dashboard/project/mdbupwurfbqcxyuxcnum
- **API URL**: https://mdbupwurfbqcxyuxcnum.supabase.co