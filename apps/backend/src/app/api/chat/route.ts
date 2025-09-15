import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { createClient } from '@supabase/supabase-js';

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

    // Save user message to database
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

    // Get conversation history
    const { data: messages, error: historyError } = await supabase
      .from('messages')
      .select('content, role')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10);

    if (historyError) {
      console.error('Error fetching history:', historyError);
    }

    // Prepare messages for LangChain
    const chatMessages = [
      new SystemMessage(SYSTEM_PROMPT),
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