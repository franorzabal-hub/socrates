# 🚀 Optimizaciones de Rendimiento - Socrates AI

## 📊 Análisis de Cuellos de Botella

### 1. **Carga Inicial de Conversaciones** (2-3 segundos)
- ❌ Se cargan TODOS los mensajes de una conversación sin límite
- ❌ No hay paginación implementada
- ❌ Ordenamiento de mensajes en el backend después de traerlos

### 2. **Flujo de Chat API** (3-5 segundos)
- ❌ Múltiples operaciones síncronas en serie
- ❌ Inicialización de Zep en cada request
- ❌ Contexto cruzado que puede no ser necesario
- ❌ Actualización del título bloquea la respuesta

### 3. **Llamadas al LLM** (2-4 segundos)
- ❌ No hay streaming de respuestas
- ❌ Se envían hasta 10 mensajes previos (puede ser excesivo)
- ❌ Modelo pesado para todas las consultas
- ❌ No hay caché de respuestas comunes

## ✅ Optimizaciones Recomendadas

### **PRIORIDAD ALTA** 🔴

#### 1. **Implementar Paginación de Mensajes**
```typescript
// apps/backend/src/app/api/conversations/[id]/route.ts
const { data: conversation, error } = await supabase
  .from('conversations')
  .select(`
    id,
    title,
    created_at,
    updated_at,
    messages (
      id,
      content,
      role,
      created_at
    )
  `)
  .eq('id', conversationId)
  .eq('user_id', userId)
  .order('messages.created_at', { ascending: false })
  .limit(20) // Solo cargar últimos 20 mensajes
  .single();
```

#### 2. **Implementar Streaming de Respuestas**
```typescript
// apps/backend/src/app/api/chat/route.ts
import { StreamingTextResponse, LangChainStream } from 'ai';

export async function POST(request: NextRequest) {
  const { stream, handlers } = LangChainStream();

  const model = new ChatGoogleGenerativeAI({
    modelName: 'gemini-1.5-flash',
    streaming: true,
    callbacks: [handlers],
  });

  // Generar respuesta con streaming
  model.invoke(chatMessages);

  return new StreamingTextResponse(stream);
}
```

#### 3. **Optimización de Contexto**
```typescript
// Reducir contexto a solo 5 mensajes más relevantes
const recentMessages = messages?.slice(-5) || [];

// Solo obtener contexto cruzado si es necesario
const needsCrossContext = message.toLowerCase().includes('recuerdas') ||
                          message.toLowerCase().includes('antes');
```

### **PRIORIDAD MEDIA** 🟡

#### 4. **Cache de Zep Sessions**
```typescript
// apps/backend/src/lib/zep.ts
const sessionCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function getOrCreateSession(
  conversationId: string,
  userId: string
): Promise<any> {
  const cacheKey = `conversation_${conversationId}`;
  const cached = sessionCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.session;
  }

  // Crear o obtener sesión...
  sessionCache.set(cacheKey, { session, timestamp: Date.now() });
  return session;
}
```

#### 5. **Paralelización de Operaciones**
```typescript
// apps/backend/src/app/api/chat/route.ts
// Ejecutar operaciones en paralelo
const [zepSession, userMessage] = await Promise.all([
  getOrCreateSession(conversationId, userId),
  supabase.from('messages').insert({
    conversation_id: conversationId,
    content: message,
    role: 'user',
  }).select().single()
]);
```

#### 6. **Actualización Asíncrona del Título**
```typescript
// No bloquear la respuesta esperando actualización del título
if (isFirstMessage) {
  // Actualizar título en background
  setImmediate(async () => {
    await supabase
      .from('conversations')
      .update({ title: truncatedMessage })
      .eq('id', conversationId);
  });
}
```

### **PRIORIDAD BAJA** 🟢

#### 7. **Optimistic UI Updates**
```typescript
// apps/mobile/src/screens/ChatScreen.tsx
const sendMessage = async () => {
  // Mostrar mensaje del usuario inmediatamente
  const userMessage = {
    id: Date.now().toString(),
    content: inputText.trim(),
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  setMessages(prev => [...prev, userMessage]);
  setInputText('');

  // Agregar mensaje "escribiendo..." temporal
  const tempAIMessage = {
    id: 'temp',
    content: '...',
    role: 'assistant',
    createdAt: new Date().toISOString(),
  };

  setMessages(prev => [...prev, tempAIMessage]);

  // Hacer llamada al API...
};
```

#### 8. **Caché de Respuestas Comunes**
```typescript
// Cache para preguntas frecuentes
const commonResponses = new Map([
  ['hola', 'respuesta_predefinida'],
  ['ayuda', 'respuesta_ayuda'],
]);

if (commonResponses.has(message.toLowerCase())) {
  return NextResponse.json({
    message: commonResponses.get(message.toLowerCase()),
    cached: true,
  });
}
```

#### 9. **Lazy Loading de Mensajes Antiguos**
```typescript
// apps/mobile/src/screens/ChatScreen.tsx
const loadMoreMessages = async () => {
  if (!hasMore || loadingMore) return;

  setLoadingMore(true);
  const olderMessages = await fetchMessages(lastMessageId, 20);
  setMessages(prev => [...olderMessages, ...prev]);
  setLoadingMore(false);
};

// En FlatList
<FlatList
  onEndReached={loadMoreMessages}
  onEndReachedThreshold={0.5}
/>
```

## 📈 Resultados Esperados

### Tiempo de Carga Actual vs Optimizado:
- **Carga inicial**: 2-3s → **0.5-1s** ✅
- **Envío de mensaje**: 3-5s → **1-2s** ✅
- **Respuesta del LLM**: 2-4s → **0.5s (primer token)** ✅

### Mejoras de UX:
- ✅ Feedback instantáneo al usuario
- ✅ Streaming de respuestas (aparecen palabra por palabra)
- ✅ Menor consumo de datos móviles
- ✅ Menor uso de memoria

## 🛠️ Plan de Implementación

### Fase 1 (Inmediato):
1. Implementar paginación de mensajes
2. Reducir contexto del LLM
3. Paralelizar operaciones

### Fase 2 (Esta semana):
1. Implementar streaming de respuestas
2. Agregar cache de sesiones
3. Optimistic UI updates

### Fase 3 (Próxima semana):
1. Lazy loading de mensajes
2. Cache de respuestas comunes
3. Métricas de rendimiento

## 📊 Métricas a Monitorear

```typescript
// Agregar logging de métricas
const startTime = Date.now();

// ... operación ...

console.log({
  operation: 'chat_response',
  duration: Date.now() - startTime,
  conversationId,
  messageLength: message.length,
  contextSize: messages.length,
});
```

## 🔧 Configuración Recomendada

### Variables de Entorno Nuevas:
```env
# Optimización
MAX_CONTEXT_MESSAGES=5
ENABLE_RESPONSE_STREAMING=true
CACHE_TTL_SECONDS=300
ENABLE_COMMON_CACHE=true
```

### Modelo LLM Optimizado:
```typescript
// Para respuestas rápidas
const fastModel = new ChatGoogleGenerativeAI({
  modelName: 'gemini-1.5-flash', // Más rápido que flash-exp
  temperature: 0.7,
  maxOutputTokens: 512, // Reducir para respuestas más rápidas
});

// Para respuestas complejas (matemáticas, etc)
const complexModel = new ChatGoogleGenerativeAI({
  modelName: 'gemini-2.0-flash-exp',
  temperature: 0.7,
  maxOutputTokens: 1024,
});
```

## 🎯 Conclusión

Con estas optimizaciones, podemos reducir el tiempo de respuesta total de **5-8 segundos** a **1-2 segundos**, mejorando significativamente la experiencia del usuario.

Las optimizaciones de **PRIORIDAD ALTA** deberían implementarse primero ya que tienen el mayor impacto con el menor esfuerzo.