import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getOrCreateSession } from '@/lib/zep';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List user conversations
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        messages (
          content,
          role,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    // Format conversations with preview
    const formattedConversations = conversations?.map(conv => ({
      id: conv.id,
      title: conv.title,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
      preview: conv.messages?.[conv.messages.length - 1]?.content || '',
      messageCount: conv.messages?.length || 0
    }));

    return NextResponse.json({ conversations: formattedConversations });

  } catch (error) {
    console.error('Conversations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new conversation
export async function POST(request: NextRequest) {
  try {
    const { userId, title } = await request.json();

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'User ID and title required' },
        { status: 400 }
      );
    }

    // For development mode, we'll use a simpler approach
    // Generate a UUID for the conversation
    const conversationId = crypto.randomUUID();

    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        id: conversationId,
        user_id: userId,
        title,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      // For development, return a mock conversation
      return NextResponse.json({
        conversation: {
          id: conversationId,
          user_id: userId,
          title,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    }

    // Initialize Zep session for the new conversation
    try {
      await getOrCreateSession(conversationId, userId);
      console.log(`Zep session created for conversation ${conversationId}`);
    } catch (zepError) {
      console.error('Error creating Zep session:', zepError);
      // Continue without Zep - not critical for conversation creation
    }

    return NextResponse.json({ conversation });

  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}