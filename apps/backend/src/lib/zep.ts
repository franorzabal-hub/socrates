import { ZepClient } from '@getzep/zep-cloud';
import { Memory, Session } from '@getzep/zep-cloud/dist/memory';

const zepClient = new ZepClient({
  apiKey: process.env.ZEP_API_KEY!,
});

export async function getOrCreateSession(userId: string): Promise<Session> {
  const sessionId = `user_${userId}`;

  try {
    // Try to get existing session
    const session = await zepClient.memory.getSession(sessionId);
    return session;
  } catch (error) {
    // Create new session if it doesn't exist
    const metadata = {
      createdAt: new Date().toISOString(),
      type: 'student',
      gradeLevel: 'primary',
      language: 'spanish',
    };

    const session = await zepClient.memory.addSession({
      sessionId,
      userId, // Add user_id directly to the session
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
    roleType: role === 'user' ? 'user' : 'assistant',
    content,
  };

  await zepClient.memory.add(sessionId, {
    messages: [message],
  });
}

export async function getMemory(sessionId: string): Promise<Memory | null> {
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