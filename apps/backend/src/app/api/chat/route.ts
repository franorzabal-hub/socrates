/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { createClient } from '@supabase/supabase-js';
import {
  getOrCreateSession,
  addMemory,
  getMemory,
  getCrossConversationContext
} from '@/lib/zep';
import { checkCommonResponse, trackResponseTime } from '@/lib/commonResponses';
import { trackAsync } from '@/lib/metrics';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Use faster model for better performance
const model = new ChatGoogleGenerativeAI({
  modelName: 'gemini-1.5-flash', // Faster than 2.0-flash-exp
  apiKey: process.env.GOOGLE_AI_API_KEY!,
  temperature: 0.7,
  maxOutputTokens: 512, // Reduced for faster responses
});

const SYSTEM_PROMPT = `Eres un tutor AI amigable y paciente para estudiantes de primaria en Latinoamérica.
Tu objetivo es ayudar a los estudiantes a aprender de forma divertida y comprensible.
- Usa un lenguaje simple y apropiado para niños de 6-12 años
- Sé alentador y positivo
- Usa ejemplos relacionados con la vida cotidiana latinoamericana
- Si no entiendes algo, pide aclaración de forma amable
- Evita temas inapropiados para niños
- Responde en español`;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  return trackAsync('api.chat', async () => {
    try {
      const { message, conversationId, userId } = await request.json();

    if (!message || !conversationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for cached response first
    const cachedResponse = await trackAsync('cache.check', async () =>
      checkCommonResponse(message)
    );

    if (cachedResponse) {
      // Track cached response time
      trackResponseTime(conversationId, startTime, true);

      // Update title if needed (even for cached responses)
      try {
        const { data: conversation } = await supabase
          .from('conversations')
          .select('title')
          .eq('id', conversationId)
          .single();

        if (conversation?.title === 'Nueva conversación') {
          const truncatedMessage = message.length > 50
            ? message.substring(0, 50) + '...'
            : message;

          await supabase
            .from('conversations')
            .update({ title: truncatedMessage })
            .eq('id', conversationId);

          console.log(`Updated title (cached): ${truncatedMessage}`);
        }
      } catch (error) {
        console.error('Error updating title for cached response:', error);
      }

      // Save both messages to database
      await trackAsync('db.message.insert.batch', async () =>
        Promise.all([
          supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              content: message,
              role: 'user',
            }),
          supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              content: cachedResponse,
              role: 'assistant',
            })
        ])
      );

      return NextResponse.json({
        message: cachedResponse,
        cached: true,
        responseTime: Date.now() - startTime
      });
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
    const [zepSession, userMessageResult] = await trackAsync('parallel.init', async () =>
      Promise.all([
        // Initialize Zep session
        trackAsync('zep.session.get', async () =>
          getOrCreateSession(conversationId, userId).catch(error => {
            console.error('Zep initialization error:', error);
            return null;
          })
        ),
        // Save user message to database
        trackAsync('db.message.insert', async () =>
          supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              content: message,
              role: 'user',
            })
            .select()
            .single()
        )
      ])
    );

    if (userMessageResult.error) {
      console.error('Error saving user message:', userMessageResult.error);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Parallel Zep operations if session exists
    if (zepSession) {
      const zepPromises = [
        getMemory(sessionId).catch(() => null),
        addMemory(sessionId, 'user', message).catch(error => {
          console.error('Error adding to Zep memory:', error);
        })
      ];

      // Add cross-conversation context if needed
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

    // Check and update title if needed (synchronously to ensure it happens)
    try {
      // Get conversation to check current title
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select('title')
        .eq('id', conversationId)
        .single();

      if (fetchError) {
        console.error('Error fetching conversation:', fetchError);
      } else if (conversation?.title === 'Nueva conversación') {
        // Only update if it's still the default title
        const truncatedMessage = message.length > 50
          ? message.substring(0, 50) + '...'
          : message;

        const { error: updateError } = await supabase
          .from('conversations')
          .update({ title: truncatedMessage })
          .eq('id', conversationId);

        if (updateError) {
          console.error('Error updating title:', updateError);
        } else {
          console.log(`Successfully updated conversation title to: ${truncatedMessage}`);
        }
      } else {
        console.log('Title already set to:', conversation?.title);
      }
    } catch (error) {
      console.error('Error in title update process:', error);
    }

    // Get only recent messages for context (5 instead of 10)
    const { data: messages } = await trackAsync('db.messages.fetch', async () =>
      supabase
        .from('messages')
        .select('content, role')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(5)
    );

    // Build context from Zep memory and cross-conversation history
    let memoryContext = '';

    // Add current conversation context
    if (zepMemory && zepMemory.summary) {
      memoryContext = `\n\nContexto de esta conversación: ${zepMemory.summary}`;
      console.log('Using conversation memory context');
    }

    // Add cross-conversation context for continuity
    if (crossConversationContext) {
      memoryContext += `\n\nHistorial del estudiante: ${crossConversationContext}`;
      console.log('Using cross-conversation context');
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

    // Generate AI response
    const response = await trackAsync('gemini.generate', async () =>
      model.invoke(chatMessages)
    );
    const aiResponse = response.content.toString();

    // Save AI response to database
    const { data: aiMessage, error: aiError } = await trackAsync('db.assistant.insert', async () =>
      supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: aiResponse,
          role: 'assistant',
        })
        .select()
        .single()
    );

    if (aiError) {
      console.error('Error saving AI message:', aiError);
      return NextResponse.json(
        { error: 'Failed to save AI response' },
        { status: 500 }
      );
    }

    // Add AI response to Zep memory
    if (zepSession) {
      try {
        await addMemory(sessionId, 'assistant', aiResponse);
        console.log('Added AI response to Zep memory');
      } catch (zepError) {
        console.error('Error adding AI response to Zep memory:', zepError);
      }
    }

    // Update conversation updated_at
    await trackAsync('db.conversation.update', async () =>
      supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)
    );

    // Track uncached response time
    trackResponseTime(conversationId, startTime, false);

    return NextResponse.json({
      message: aiResponse,
      messageId: aiMessage.id,
    });

    } catch (error) {
      console.error('Chat API error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}