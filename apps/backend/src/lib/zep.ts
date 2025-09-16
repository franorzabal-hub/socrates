/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ZepClient } from '@getzep/zep-cloud';

const zepClient = new ZepClient({
  apiKey: process.env.ZEP_API_KEY!,
});

export async function getOrCreateSession(
  conversationId: string,
  userId: string,
  subject?: string
): Promise<any> {
  // Use conversation ID as the primary session identifier
  const sessionId = `conversation_${conversationId}`;

  try {
    // Try to get existing session
    const session = await zepClient.memory.getSession(sessionId);
    return session;
  } catch (error) {
    // Create new session if it doesn't exist
    const metadata = {
      createdAt: new Date().toISOString(),
      conversationId,
      userId,
      subject: subject || 'general',
      type: 'student',
      gradeLevel: 'primary',
      language: 'spanish',
    };

    const session = await zepClient.memory.addSession({
      sessionId,
      userId, // Keep user_id for user-level analytics
      metadata,
    });

    return session;
  }
}

export async function addMemory(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  const message = {
    roleType: role as any, // Cast to any to avoid type conflict
    content,
  };

  await zepClient.memory.add(sessionId, {
    messages: [message],
  });
}

export async function getMemory(sessionId: string): Promise<any | null> {
  try {
    const memory = await zepClient.memory.get(sessionId);
    return memory;
  } catch (error) {
    console.error('Error fetching memory:', error);
    return null;
  }
}

export async function searchMemory(
  sessionId: string,
  query: string,
  limit: number = 5
): Promise<any> {
  try {
    const searchResults = await zepClient.memory.searchSessions({
      text: query,
      sessionIds: [sessionId],
      limit,
    });
    return searchResults;
  } catch (error) {
    console.error('Error searching memory:', error);
    return null;
  }
}

// Get all sessions for a user (cross-conversation context)
export async function getUserSessions(userId: string): Promise<any[]> {
  try {
    // For now, return empty array as cross-conversation context
    // This feature requires proper Zep SDK implementation
    return [];
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return [];
  }
}

// Get cross-conversation context for better continuity
export async function getCrossConversationContext(
  userId: string,
  currentSessionId: string,
  limit: number = 3
): Promise<string> {
  try {
    const userSessions = await getUserSessions(userId);
    const recentSessions = userSessions
      .filter(s => s.sessionId !== currentSessionId)
      .slice(0, limit);

    let context = '';
    for (const session of recentSessions) {
      const memory = await getMemory(session.sessionId);
      if (memory?.summary) {
        context += `\n${memory.summary}`;
      }
    }
    return context;
  } catch (error) {
    console.error('Error getting cross-conversation context:', error);
    return '';
  }
}

export async function updateSessionMetadata(
  sessionId: string,
  metadata: Record<string, any>
): Promise<void> {
  try {
    await zepClient.memory.updateSession(sessionId, {
      metadata,
    });
  } catch (error) {
    console.error('Error updating session metadata:', error);
  }
}