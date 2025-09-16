/* eslint-disable @typescript-eslint/no-explicit-any */

interface CachedTopic {
  keywords: string[];
  response: string;
  variations?: RegExp[];
}

// Topics con múltiples formas de preguntar
const educationalTopics: CachedTopic[] = [
  {
    keywords: ['numero', 'primo', 'primos', 'numeros'],
    variations: [
      /primer?o?s?\s+numeros?/i,
      /numeros?\s+primos?/i,
      /que\s+(son|es)\s+(los?\s+)?numeros?\s+primos?/i,
      /explica(me)?\s+(los?\s+)?numeros?\s+primos?/i,
      /dime\s+.*\s+primos?/i,
      /habla(me)?\s+.*\s+primos?/i
    ],
    response: 'Los números primos son números especiales que solo se pueden dividir entre 1 y ellos mismos. 🔢\n\nPor ejemplo:\n• 2 es primo (solo se divide entre 1 y 2)\n• 3 es primo (solo se divide entre 1 y 3)\n• 5 es primo (solo se divide entre 1 y 5)\n• 7 es primo (solo se divide entre 1 y 7)\n\nPero 4 NO es primo porque se puede dividir entre 1, 2 y 4. ¡Los primeros números primos son: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29!'
  },
  {
    keywords: ['planeta', 'planetas', 'sistema', 'solar'],
    variations: [
      /planetas?\s+(del\s+)?sistema\s+solar/i,
      /(cuales|cuantos)\s+son\s+los\s+planetas?/i,
      /dime\s+los\s+planetas?/i,
      /nombra(me)?\s+los\s+planetas?/i,
      /que\s+planetas?\s+hay/i
    ],
    response: 'Los planetas de nuestro Sistema Solar son 8: 🌍\n\n1. **Mercurio** - El más pequeño y cercano al Sol ☀️\n2. **Venus** - El más caliente\n3. **Tierra** - ¡Nuestro hogar! 🌍\n4. **Marte** - El planeta rojo\n5. **Júpiter** - El más grande\n6. **Saturno** - El de los anillos\n7. **Urano** - Está inclinado\n8. **Neptuno** - El más lejano\n\n¡Puedes recordarlos con: "Mi Vieja Tía Marta Jamás Supo Usar Nada"!'
  },
  {
    keywords: ['multiplicar', 'multiplicacion', 'multiplica'],
    variations: [
      /que\s+es\s+(la\s+)?multiplicaci?on/i,
      /como\s+se?\s+multiplica/i,
      /explica(me)?\s+(la\s+)?multiplicaci?on/i,
      /para\s+que\s+sirve\s+(la\s+)?multiplicaci?on/i
    ],
    response: 'La multiplicación es sumar el mismo número varias veces. ✖️\n\nPor ejemplo:\n• 3 × 4 = 3 + 3 + 3 + 3 = 12\n• 2 × 5 = 2 + 2 + 2 + 2 + 2 = 10\n\n¡Es como hacer grupos! Si tienes 3 grupos de 4 manzanas 🍎, tienes 12 manzanas en total.'
  },
  {
    keywords: ['dividir', 'division', 'divide'],
    variations: [
      /que\s+es\s+(la\s+)?divisi?on/i,
      /como\s+se?\s+divide/i,
      /explica(me)?\s+(la\s+)?divisi?on/i,
      /para\s+que\s+sirve\s+(la\s+)?divisi?on/i
    ],
    response: 'La división es repartir en partes iguales. ➗\n\nPor ejemplo:\n• 12 ÷ 3 = 4 (si tienes 12 dulces y los repartes entre 3 amigos, cada uno recibe 4)\n• 10 ÷ 2 = 5 (si tienes 10 galletas y las divides en 2 grupos, cada grupo tiene 5)\n\n¡Es lo contrario de la multiplicación!'
  },
  {
    keywords: ['fraccion', 'fracciones', 'quebrado', 'parte'],
    variations: [
      /que\s+(son|es)\s+(las?\s+)?fracciones?/i,
      /explica(me)?\s+(las?\s+)?fracciones?/i,
      /como\s+funcionan?\s+(las?\s+)?fracciones?/i,
      /para\s+que\s+sirven?\s+(las?\s+)?fracciones?/i
    ],
    response: 'Las fracciones son partes de un entero. 🍕\n\nPor ejemplo:\n• 1/2 = la mitad (como media pizza)\n• 1/4 = un cuarto (como un pedazo de un pastel dividido en 4)\n• 3/4 = tres cuartos (como 3 pedazos de 4)\n\nEl número de arriba (numerador) dice cuántas partes tienes, y el de abajo (denominador) dice en cuántas partes se dividió el entero.'
  },
  {
    keywords: ['fotosintesis', 'planta', 'plantas'],
    variations: [
      /que\s+es\s+(la\s+)?fotosintesis/i,
      /como\s+hacen?\s+fotosintesis/i,
      /como\s+comen?\s+(las\s+)?plantas?/i,
      /como\s+se\s+alimentan?\s+(las\s+)?plantas?/i
    ],
    response: 'La fotosíntesis es cómo las plantas hacen su propia comida. 🌱\n\nLas plantas necesitan:\n• ☀️ Luz del sol\n• 💧 Agua (por las raíces)\n• 🌬️ Dióxido de carbono (del aire)\n\nCon estos ingredientes, las hojas verdes (con clorofila) convierten todo en:\n• 🍃 Glucosa (su alimento)\n• 💨 Oxígeno (que nosotros respiramos)\n\n¡Por eso las plantas son tan importantes para nosotros!'
  },
  {
    keywords: ['agua', 'ciclo', 'lluvia'],
    variations: [
      /ciclo\s+del?\s+agua/i,
      /como\s+se\s+forma\s+(la\s+)?lluvia/i,
      /por\s+que\s+llueve/i,
      /de\s+donde\s+viene\s+(la\s+)?lluvia/i
    ],
    response: 'El ciclo del agua es un viaje circular que hace el agua. 💧\n\n1. **Evaporación** ☀️: El sol calienta el agua de ríos y mares, y se convierte en vapor\n2. **Condensación** ☁️: El vapor sube y se enfría, formando nubes\n3. **Precipitación** 🌧️: Las gotas en las nubes se hacen pesadas y caen como lluvia\n4. **Infiltración** 🏞️: El agua llega a ríos, lagos y bajo la tierra\n\n¡Y vuelve a empezar! Por eso nunca se acaba el agua en la Tierra.'
  }
];

// Diccionario de sinónimos para mejorar matching
const synonyms: Record<string, string[]> = {
  'que': ['cual', 'cuales', 'qué', 'cuál'],
  'es': ['son', 'significa', 'quiere decir'],
  'explica': ['explicame', 'dime', 'habla', 'cuenta', 'enseña'],
  'como': ['cómo', 'de que forma', 'de que manera']
};

// Función para calcular similitud entre strings
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // Si contiene todas las palabras clave, alta similitud
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);

  let matchCount = 0;
  for (const word of words1) {
    if (words2.some(w => w.includes(word) || word.includes(w))) {
      matchCount++;
    }
  }

  return matchCount / Math.max(words1.length, words2.length);
}

export function findSmartCachedResponse(message: string): string | null {
  // Normalizar mensaje
  const normalizedMessage = message
    .toLowerCase()
    .replace(/[¿¡¡!?.,;]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  console.log('Smart cache checking:', normalizedMessage);

  // Buscar por topics
  for (const topic of educationalTopics) {
    // Primero verificar si tiene keywords relevantes
    const hasKeywords = topic.keywords.some(keyword =>
      normalizedMessage.includes(keyword)
    );

    if (!hasKeywords) continue;

    // Luego verificar variaciones
    if (topic.variations) {
      for (const variation of topic.variations) {
        if (variation.test(normalizedMessage)) {
          console.log('Smart cache hit! Topic:', topic.keywords[0]);
          return topic.response;
        }
      }
    }

    // Si tiene keywords pero no matchea variaciones, calcular similitud
    const similarity = calculateSimilarity(
      normalizedMessage,
      topic.keywords.join(' ')
    );

    if (similarity > 0.5) {
      console.log('Smart cache hit by similarity! Topic:', topic.keywords[0], 'Similarity:', similarity);
      return topic.response;
    }
  }

  // Cache para matemáticas simples
  const mathPattern = /(\d+)\s*([+\-*\/])\s*(\d+)/;
  const mathMatch = normalizedMessage.match(mathPattern);

  if (mathMatch) {
    const num1 = parseInt(mathMatch[1]);
    const operator = mathMatch[2];
    const num2 = parseInt(mathMatch[3]);

    // Solo cachear operaciones simples (números pequeños)
    if (num1 <= 100 && num2 <= 100) {
      let result: number;
      let symbol: string;

      switch (operator) {
        case '+':
          result = num1 + num2;
          symbol = '+';
          break;
        case '-':
          result = num1 - num2;
          symbol = '-';
          break;
        case '*':
          result = num1 * num2;
          symbol = '×';
          break;
        case '/':
          if (num2 === 0) return null;
          result = num1 / num2;
          symbol = '÷';
          break;
        default:
          return null;
      }

      // Detectar si es una pregunta o solo la operación
      const isQuestion = /que|cual|cuanto|resultado/.test(normalizedMessage);

      if (isQuestion) {
        return `¡Fácil! ${num1} ${symbol} ${num2} = ${result} 😊`;
      } else {
        return `${num1} ${symbol} ${num2} = ${result}`;
      }
    }
  }

  return null;
}

// Exportar también la función simple para retrocompatibilidad
export { checkCommonResponse } from './commonResponses';