import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

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
      .single();

    if (error) {
      console.error('Error fetching conversation:', error);
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Sort messages by created_at
    if (conversation.messages) {
      conversation.messages.sort((a: any, b: any) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }

    return NextResponse.json({ conversation });

  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting conversation:', error);
      return NextResponse.json(
        { error: 'Failed to delete conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}