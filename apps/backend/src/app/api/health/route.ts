import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      googleAiKey: !!process.env.GOOGLE_AI_API_KEY,
      zepApiKey: !!process.env.ZEP_API_KEY,
      nodeEnv: process.env.NODE_ENV,
    };

    // Try to connect to Supabase
    let supabaseConnection = false;
    let tableCheck = false;
    let errorMessage = null;

    if (envCheck.supabaseUrl && envCheck.supabaseServiceKey) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Try to query conversations table
        const { error } = await supabase
          .from('conversations')
          .select('id')
          .limit(1);

        supabaseConnection = !error;
        if (!error) {
          tableCheck = true;
        } else {
          errorMessage = error.message;
          console.error('Supabase table check error:', error);
        }
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Supabase connection error:', error);
      }
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      supabase: {
        connected: supabaseConnection,
        tablesAccessible: tableCheck,
        error: errorMessage
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}