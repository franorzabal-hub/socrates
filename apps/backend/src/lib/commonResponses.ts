/* eslint-disable @typescript-eslint/no-explicit-any */

// Cache for common questions and responses
interface CachedResponse {
  pattern: RegExp;
  response: string;
  requiresContext?: boolean;
}

// Educational common questions
const educationalResponses: CachedResponse[] = [
  {
    pattern: /numeros? primos?/i,
    response: 'Los números primos son números especiales que solo se pueden dividir entre 1 y ellos mismos. 🅰️\n\nPor ejemplo:\n• 2 es primo (solo se divide entre 1 y 2)\n• 3 es primo (solo se divide entre 1 y 3)\n• 5 es primo (solo se divide entre 1 y 5)\n• 7 es primo (solo se divide entre 1 y 7)\n\nPero 4 NO es primo porque se puede dividir entre 1, 2 y 4. ¡Los primeros números primos son: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29!',
    requiresContext: false
  },
  {
    pattern: /multiplicacion/i,
    response: 'La multiplicación es sumar el mismo número varias veces. ✏️\n\nPor ejemplo:\n• 3 × 4 = 3 + 3 + 3 + 3 = 12\n• 2 × 5 = 2 + 2 + 2 + 2 + 2 = 10\n\n¡Es como hacer grupos! Si tienes 3 grupos de 4 manzanas 🍎, tienes 12 manzanas en total.',
    requiresContext: false
  },
  {
    pattern: /los planetas|planetas del sistema solar/i,
    response: 'Los planetas de nuestro Sistema Solar son 8: 🌍\n\n1. **Mercurio** - El más pequeño y cercano al Sol ☀️\n2. **Venus** - El más caliente\n3. **Tierra** - ¡Nuestro hogar! 🌍\n4. **Marte** - El planeta rojo\n5. **Júpiter** - El más grande\n6. **Saturno** - El de los anillos\n7. **Urano** - Está inclinado\n8. **Neptuno** - El más lejano\n\n¡Puedes recordarlos con: "Mi Vieja Tía Marta Jamás Supo Usar Nada"!',
    requiresContext: false
  },
  {
    pattern: /fracciones/i,
    response: 'Las fracciones son partes de un entero. 🍕\n\nPor ejemplo:\n• 1/2 = la mitad (como media pizza)\n• 1/4 = un cuarto (como un pedazo de un pastel dividido en 4)\n• 3/4 = tres cuartos (como 3 pedazos de 4)\n\nEl número de arriba (numerador) dice cuántas partes tienes, y el de abajo (denominador) dice en cuántas partes se dividió el entero.',
    requiresContext: false
  },
  {
    pattern: /division/i,
    response: 'La división es repartir en partes iguales. 🍰\n\nPor ejemplo:\n• 12 ÷ 3 = 4 (si tienes 12 dulces y los repartes entre 3 amigos, cada uno recibe 4)\n• 10 ÷ 2 = 5 (si tienes 10 galletas y las divides en 2 grupos, cada grupo tiene 5)\n\n¡Es lo contrario de la multiplicación!',
    requiresContext: false
  },
  {
    pattern: /tabla del? \d+|tabla de multiplicar/i,
    response: 'Las tablas de multiplicar son súper útiles. ¡Te ayudo con la que necesites! 📊\n\nPor ejemplo, la tabla del 2:\n• 2 × 1 = 2\n• 2 × 2 = 4\n• 2 × 3 = 6\n• 2 × 4 = 8\n• 2 × 5 = 10\n\n¡Dime qué tabla específica quieres practicar!',
    requiresContext: false
  }
];

// Common greetings and responses
export const commonResponses: CachedResponse[] = [
  ...educationalResponses, // Add educational responses first
  {
    pattern: /^(hola|hi|hey|buenas|buenos dias|buenas tardes|buenas noches)$/i,
    response: '¡Hola! 😊 ¿En qué puedo ayudarte hoy? Puedo ayudarte con matemáticas, ciencias, historia, o cualquier tema que estés estudiando.',
    requiresContext: false
  },
  {
    pattern: /^(ayuda|help|ayudame|necesito ayuda)$/i,
    response: '¡Por supuesto! Estoy aquí para ayudarte. ¿Qué necesitas aprender hoy? Puedes preguntarme sobre:\n\n• 📚 Tareas escolares\n• 🔢 Matemáticas\n• 🌍 Ciencias\n• 📖 Historia\n• 🎨 Arte\n\n¡Solo dime qué tema te interesa!',
    requiresContext: false
  },
  {
    pattern: /^(adios|bye|chau|hasta luego|nos vemos)$/i,
    response: '¡Hasta luego! 👋 Fue un gusto ayudarte. ¡Recuerda que siempre estaré aquí cuando necesites aprender algo nuevo! ¡Que tengas un excelente día!',
    requiresContext: false
  },
  {
    pattern: /^(gracias|thanks|muchas gracias|te agradezco)$/i,
    response: '¡De nada! 😊 Me alegra mucho poder ayudarte. Si tienes más preguntas, no dudes en preguntarme. ¡Estoy aquí para ayudarte a aprender!',
    requiresContext: false
  },
  {
    pattern: /^(quien eres|que eres|como te llamas)$/i,
    response: '¡Hola! Soy tu tutor AI de Sócrates. 🤖📚 Estoy aquí para ayudarte a aprender de forma divertida. Puedo explicarte temas de la escuela, ayudarte con tareas, y responder tus preguntas. ¡Piensa en mí como un amigo que siempre está listo para ayudarte a estudiar!',
    requiresContext: false
  },
  {
    pattern: /^(que puedes hacer|que sabes hacer|como funciona esto)$/i,
    response: 'Puedo ayudarte con muchas cosas:\n\n📚 **Tareas escolares**: Te explico paso a paso\n🔢 **Matemáticas**: Sumas, restas, multiplicaciones, fracciones\n🌍 **Ciencias**: Planetas, animales, plantas, el cuerpo humano\n📖 **Historia**: Eventos importantes, personajes históricos\n🎨 **Arte y creatividad**: Ideas para proyectos\n\n¡Solo pregúntame lo que necesites saber!',
    requiresContext: false
  }
];

// Quick math facts cache
export const mathFactsCache = new Map<string, string>([
  ['2+2', '2 + 2 = 4'],
  ['3+3', '3 + 3 = 6'],
  ['5+5', '5 + 5 = 10'],
  ['10+10', '10 + 10 = 20'],
  ['2*2', '2 × 2 = 4'],
  ['3*3', '3 × 3 = 9'],
  ['5*5', '5 × 5 = 25'],
  ['10*10', '10 × 10 = 100'],
  ['10-5', '10 - 5 = 5'],
  ['20-10', '20 - 10 = 10'],
]);

// Pattern for questions about math
const mathQuestionPatterns = [
  /^(?:que es|cuanto es|cual es el resultado de)?\s*(\d+)\s*([+\-*\/])\s*(\d+)\s*\??$/i,
  /^(\d+)\s*([+\-*\/])\s*(\d+)\s*(?:es)?\s*\??$/i,
];

export function checkCommonResponse(message: string): string | null {
  // Clean and normalize the message
  const cleanMessage = message.trim().toLowerCase()
    .replace(/[¿¡]/g, '') // Remove Spanish punctuation
    .replace(/[,;.!?]+$/, '') // Remove trailing punctuation
    .replace(/\s+/g, ' '); // Normalize spaces

  console.log('Checking cache for:', cleanMessage);

  // Check for exact matches in common responses
  for (const cached of commonResponses) {
    if (cached.pattern.test(cleanMessage)) {
      console.log('Cache hit! Pattern matched:', cached.pattern.toString());
      return cached.response;
    }
  }

  // Check for simple math operations or math questions
  let mathMatch = null;

  // First try direct pattern
  const directMathPattern = /^(\d+)\s*([+\-*\/])\s*(\d+)$/;
  mathMatch = cleanMessage.match(directMathPattern);

  // If not found, try question patterns
  if (!mathMatch) {
    for (const pattern of mathQuestionPatterns) {
      const match = cleanMessage.match(pattern);
      if (match) {
        // Extract the numbers and operator from the match
        // The last 3 captured groups should be num1, operator, num2
        const groups = match.filter(g => g !== undefined);
        if (groups.length >= 4) {
          mathMatch = [match[0], groups[groups.length - 3], groups[groups.length - 2], groups[groups.length - 1]];
          break;
        }
      }
    }
  }

  if (mathMatch) {
    const num1 = parseInt(mathMatch[1]);
    const operator = mathMatch[2];
    const num2 = parseInt(mathMatch[3]);

    // Only cache simple operations (results under 1000)
    if (num1 <= 100 && num2 <= 100) {
      let result: number;
      let operatorSymbol: string;

      switch (operator) {
        case '+':
          result = num1 + num2;
          operatorSymbol = '+';
          break;
        case '-':
          result = num1 - num2;
          operatorSymbol = '-';
          break;
        case '*':
          result = num1 * num2;
          operatorSymbol = '×';
          break;
        case '/':
          if (num2 === 0) return null; // Don't cache division by zero
          result = num1 / num2;
          operatorSymbol = '÷';
          break;
        default:
          return null;
      }

      // Check if it was a question format
      const wasQuestion = cleanMessage.includes('que') || cleanMessage.includes('cuanto') || cleanMessage.includes('cual');

      if (wasQuestion) {
        return `¡Fácil! ${num1} ${operatorSymbol} ${num2} = ${result} 😊`;
      } else {
        return `${num1} ${operatorSymbol} ${num2} = ${result}`;
      }
    }
  }

  return null;
}

// Response time tracking
interface ResponseMetric {
  timestamp: number;
  duration: number;
  cached: boolean;
  conversationId: string;
}

const metrics: ResponseMetric[] = [];
const MAX_METRICS = 100;

export function trackResponseTime(
  conversationId: string,
  startTime: number,
  cached: boolean
): void {
  const duration = Date.now() - startTime;

  metrics.push({
    timestamp: Date.now(),
    duration,
    cached,
    conversationId
  });

  // Keep only last 100 metrics
  if (metrics.length > MAX_METRICS) {
    metrics.shift();
  }

  // Log if response is slow
  if (duration > 2000 && !cached) {
    console.warn(`Slow response: ${duration}ms for conversation ${conversationId}`);
  }
}

export function getAverageResponseTime(): {
  average: number;
  cached: number;
  uncached: number;
} {
  if (metrics.length === 0) {
    return { average: 0, cached: 0, uncached: 0 };
  }

  const cachedMetrics = metrics.filter(m => m.cached);
  const uncachedMetrics = metrics.filter(m => !m.cached);

  const average = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
  const cached = cachedMetrics.length > 0
    ? cachedMetrics.reduce((sum, m) => sum + m.duration, 0) / cachedMetrics.length
    : 0;
  const uncached = uncachedMetrics.length > 0
    ? uncachedMetrics.reduce((sum, m) => sum + m.duration, 0) / uncachedMetrics.length
    : 0;

  return {
    average: Math.round(average),
    cached: Math.round(cached),
    uncached: Math.round(uncached)
  };
}