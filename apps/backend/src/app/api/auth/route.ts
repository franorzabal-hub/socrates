import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Create or update user profile after auth
export async function POST(request: NextRequest) {
  try {
    const { userId, email, name } = await request.json();

    if (!userId || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upsert user profile
    const { data: user, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email,
        name,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting user:', error);
      return NextResponse.json(
        { error: 'Failed to create/update user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}