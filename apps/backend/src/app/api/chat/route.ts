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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const model = new ChatGoogleGenerativeAI({
  modelName: 'gemini-2.0-flash-exp',
  apiKey: process.env.GOOGLE_AI_API_KEY!,
  temperature: 0.7,
  maxOutputTokens: 1024,
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
  try {
    const { message, conversationId, userId } = await request.json();

    if (!message || !conversationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize Zep session for this specific conversation
    let zepSession: any;
    let zepMemory: any;
    let crossConversationContext = '';
    const sessionId = `conversation_${conversationId}`;

    try {
      // Create session for this conversation
      zepSession = await getOrCreateSession(conversationId, userId);

      // Get memory for current conversation
      zepMemory = await getMemory(sessionId);

      // Get cross-conversation context for better continuity
      crossConversationContext = await getCrossConversationContext(userId, sessionId);

      console.log('Zep session initialized:', sessionId);
    } catch (zepError) {
      console.error('Zep initialization error (continuing without memory):', zepError);
    }

    // Save user message to database
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: userMessage, error: userError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content: message,
        role: 'user',
      })
      .select()
      .single();

    if (userError) {
      console.error('Error saving user message:', userError);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Add message to Zep memory
    if (zepSession) {
      try {
        await addMemory(sessionId, 'user', message);
        console.log('Added user message to Zep memory');
      } catch (zepError) {
        console.error('Error adding to Zep memory:', zepError);
      }
    }

    // Get conversation history BEFORE saving new message
    const { data: existingMessages, error: historyError } = await supabase
      .from('messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .limit(1);

    if (historyError) {
      console.error('Error fetching history:', historyError);
    }

    // Check if this is the first message and update title
    const isFirstMessage = !existingMessages || existingMessages.length === 0;
    if (isFirstMessage) {
      // Get current conversation to check title
      const { data: conversation } = await supabase
        .from('conversations')
        .select('title')
        .eq('id', conversationId)
        .single();

      // If title is "Nueva conversación", update it based on first message
      if (conversation?.title === 'Nueva conversación') {
        const truncatedMessage = message.length > 50
          ? message.substring(0, 50) + '...'
          : message;

        await supabase
          .from('conversations')
          .update({ title: truncatedMessage })
          .eq('id', conversationId);
      }
    }

    // Get full conversation history for context
    const { data: messages } = await supabase
      .from('messages')
      .select('content, role')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10);

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

    // Prepare messages for LangChain
    const chatMessages = [
      new SystemMessage(SYSTEM_PROMPT + memoryContext),
      ...(messages || []).slice(0, -1).map(msg =>
        msg.role === 'user'
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      ),
      new HumanMessage(message)
    ];

    // Generate AI response
    const response = await model.invoke(chatMessages);
    const aiResponse = response.content.toString();

    // Save AI response to database
    const { data: aiMessage, error: aiError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content: aiResponse,
        role: 'assistant',
      })
      .select()
      .single();

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
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

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
}