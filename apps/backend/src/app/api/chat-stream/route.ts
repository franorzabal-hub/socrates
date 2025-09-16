/* eslint-disable @typescript-eslint/no-explicit-any */
import { StreamingTextResponse, LangChainStream } from 'ai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { createClient } from '@supabase/supabase-js';
import {
  getOrCreateSession,
  addMemory,
  getMemory,
  getCrossConversationContext
} from '@/lib/zep';
import { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SYSTEM_PROMPT = `Eres un tutor AI amigable y paciente para estudiantes de primaria en Latinoamérica.
Tu objetivo es ayudar a los estudiantes a aprender de forma divertida y comprensible.
- Usa un lenguaje simple y apropiado para niños de 6-12 años
- Sé alentador y positivo
- Usa ejemplos relacionados con la vida cotidiana latinoamericana
- Si no entiendes algo, pide aclaración de forma amable
- Evita temas inapropiados para niños
- Responde en español`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, userId } = await request.json();

    if (!message || !conversationId || !userId) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Initialize variables
    const sessionId = `conversation_${conversationId}`;
    let zepMemory: any;
    let crossConversationContext = '';

    // Check if we need cross-conversation context
    const needsCrossContext = message.toLowerCase().includes('recuerdas') ||
                            message.toLowerCase().includes('antes') ||
                            message.toLowerCase().includes('hablamos');

    // Parallel operations for better performance
    const [zepSession, userMessageResult] = await Promise.all([
      // Initialize Zep session
      getOrCreateSession(conversationId, userId).catch(error => {
        console.error('Zep initialization error:', error);
        return null;
      }),
      // Save user message to database
      supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: message,
          role: 'user',
        })
        .select()
        .single()
    ]);

    if (userMessageResult.error) {
      return new Response('Failed to save message', { status: 500 });
    }

    // Parallel Zep operations if session exists
    if (zepSession) {
      const zepPromises = [
        getMemory(sessionId).catch(() => null),
        addMemory(sessionId, 'user', message).catch(error => {
          console.error('Error adding to Zep memory:', error);
        })
      ];

      if (needsCrossContext) {
        zepPromises.push(
          getCrossConversationContext(userId, sessionId).catch(() => '')
        );
      }

      const zepResults = await Promise.all(zepPromises);
      zepMemory = zepResults[0];
      if (needsCrossContext) {
        crossConversationContext = zepResults[2] as string;
      }
    }

    // Get only recent messages for context (5 instead of 10)
    const { data: messages } = await supabase
      .from('messages')
      .select('content, role')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Build context from Zep memory and cross-conversation history
    let memoryContext = '';

    // Add current conversation context
    if (zepMemory && zepMemory.summary) {
      memoryContext = `\n\nContexto de esta conversación: ${zepMemory.summary}`;
    }

    // Add cross-conversation context for continuity
    if (crossConversationContext) {
      memoryContext += `\n\nHistorial del estudiante: ${crossConversationContext}`;
    }

    // Prepare messages for LangChain (reverse messages back to chronological)
    const recentMessages = messages ? messages.reverse() : [];
    const chatMessages = [
      new SystemMessage(SYSTEM_PROMPT + memoryContext),
      ...recentMessages.slice(0, -1).map(msg =>
        msg.role === 'user'
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      ),
      new HumanMessage(message)
    ];

    // Create streaming response
    const { stream, handlers } = LangChainStream({
      onFinal: async (completion) => {
        // Save AI response to database after streaming is complete
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            content: completion,
            role: 'assistant',
          });

        // Add to Zep memory
        if (zepSession) {
          await addMemory(sessionId, 'assistant', completion).catch(error => {
            console.error('Error adding AI response to Zep:', error);
          });
        }

        // Update conversation timestamp
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      }
    });

    // Initialize model with streaming
    const model = new ChatGoogleGenerativeAI({
      modelName: 'gemini-1.5-flash',
      apiKey: process.env.GOOGLE_AI_API_KEY!,
      temperature: 0.7,
      maxOutputTokens: 512,
      streaming: true,
      callbacks: [handlers],
    });

    // Update title synchronously before streaming
    try {
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select('title')
        .eq('id', conversationId)
        .single();

      if (!fetchError && conversation?.title === 'Nueva conversación') {
        const truncatedMessage = message.length > 50
          ? message.substring(0, 50) + '...'
          : message;

        const { error: updateError } = await supabase
          .from('conversations')
          .update({ title: truncatedMessage })
          .eq('id', conversationId);

        if (!updateError) {
          console.log(`Updated conversation title to: ${truncatedMessage}`);
        } else {
          console.error('Error updating title:', updateError);
        }
      }
    } catch (error) {
      console.error('Error in title update:', error);
    }

    // Generate response (non-blocking)
    model.invoke(chatMessages);

    // Return streaming response
    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error('Chat streaming error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}