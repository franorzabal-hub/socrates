import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
}

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);

  const conversationId = (route.params as any)?.conversationId;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const [hasMoreMessages, setHasMoreMessages] = useState(false); // Start as false
  const [loadingMore, setLoadingMore] = useState(false);
  const [messageOffset, setMessageOffset] = useState(0);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [messageIds, setMessageIds] = useState<Set<string>>(new Set()); // Track unique messages
  const testUserId = 'df5cf0d5-c064-482c-87df-6100a8475a60'; // Fixed test user ID
  const MESSAGE_LIMIT = 20; // Load 20 messages at a time

  useEffect(() => {
    // Si recibimos un nuevo conversationId por params, lo usamos
    if (conversationId && conversationId !== currentConversationId) {
      setCurrentConversationId(conversationId);
      setMessages([]);
      fetchMessages(true, conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    // Solo crear nueva conversación al montar si no hay ID
    if (!currentConversationId && !conversationId) {
      createNewConversation();
    } else if (currentConversationId && !conversationId) {
      // Solo fetch si tenemos ID y no viene de params
      fetchMessages();
    }
  }, []);

  const createNewConversation = async () => {
    try {
      // First, ensure user exists
      const authResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: testUserId,
          email: 'test@example.com',
          name: 'Usuario de Prueba',
        }),
      });

      if (!authResponse.ok) {
        console.error('Failed to create user');
        return;
      }

      // Then create conversation
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: testUserId,
          title: 'Nueva conversación',
        }),
      });

      if (!response.ok) {
        console.error('Failed to create conversation');
        return;
      }

      const data = await response.json();
      if (data.conversation && data.conversation.id) {
        setCurrentConversationId(data.conversation.id);
        // Don't fetch messages here - the empty state is already showing
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const fetchMessages = async (isInitial = true, specificConvId?: string) => {
    const convId = specificConvId || currentConversationId;
    if (!convId) return;

    if (isInitial) {
      setLoading(true);
      setMessageOffset(0);
      setHasMoreMessages(false); // Reset to false
      setMessageIds(new Set()); // Clear message IDs
    } else {
      setLoadingMore(true);
    }

    try {
      const offset = isInitial ? 0 : messageOffset;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/conversations/${convId}?limit=${MESSAGE_LIMIT}&offset=${offset}`,
        {
          headers: {
            'x-user-id': testUserId,
          },
        }
      );
      const data = await response.json();
      const newMessages = data.conversation?.messages || [];

      // Filter out duplicates using message IDs
      const uniqueMessages = newMessages.filter(msg => {
        if (messageIds.has(msg.id)) {
          console.log('Duplicate message filtered:', msg.id);
          return false;
        }
        return true;
      });

      // Update message IDs set
      const newIds = new Set(messageIds);
      uniqueMessages.forEach(msg => newIds.add(msg.id));
      setMessageIds(newIds);

      if (isInitial) {
        setMessages(uniqueMessages);
      } else {
        // Prepend older messages to the beginning
        setMessages(prev => [...uniqueMessages, ...prev]);
      }

      // Only show 'load more' if we got a full page of messages
      if (newMessages.length >= MESSAGE_LIMIT) {
        setHasMoreMessages(true);
      } else {
        setHasMoreMessages(false);
      }

      setMessageOffset(offset + newMessages.length);

      // Check if this is a conversation with messages
      if (newMessages.length > 0) {
        setIsFirstMessage(false);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreMessages = () => {
    if (!loadingMore && hasMoreMessages && currentConversationId) {
      fetchMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !currentConversationId) return;

    // Prevent double-submission
    if (thinking) {
      console.log('Already processing a message, ignoring');
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputText.trim(),
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    console.log('Sending message:', userMessage.content);

    // Check for duplicate submission
    if (messageIds.has(userMessage.id)) {
      console.log('Duplicate message prevented');
      return;
    }

    // Optimistic update - show user message immediately
    setMessages((prev) => {
      // Check if message already exists
      const exists = prev.some(msg => msg.id === userMessage.id);
      if (exists) {
        console.log('Message already exists, not adding');
        return prev;
      }
      return [...prev, userMessage];
    });

    // Add to message IDs
    setMessageIds(prev => new Set([...prev, userMessage.id]));

    setInputText('');
    setThinking(true);

    // Track if this was the first message
    const wasFirstMessage = isFirstMessage;
    if (isFirstMessage) {
      setIsFirstMessage(false);
    }

    try {
      // Disable streaming for now - it's causing issues in React Native
      const useStreaming = false; // Disabled until we fix streaming support

      if (useStreaming) {
        // Streaming is currently disabled
      } else {
        // Use regular endpoint
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage.content,
            conversationId: currentConversationId,
            userId: testUserId,
          }),
        });

        const data = await response.json();

        if (data.message) {
          const aiMessage: Message = {
            id: data.messageId || `ai-${Date.now()}`,
            content: data.message,
            role: 'assistant',
            createdAt: new Date().toISOString(),
          };
          console.log('Received AI response:', aiMessage.content.substring(0, 50) + '...');
          console.log('Response was cached:', data.cached || false);

          // Check for duplicate before adding
          setMessages((prev) => {
            const exists = prev.some(msg => msg.id === aiMessage.id ||
              (msg.content === aiMessage.content && msg.role === 'assistant' &&
               Math.abs(new Date(msg.createdAt).getTime() - new Date(aiMessage.createdAt).getTime()) < 5000));
            if (exists) {
              console.log('AI message already exists or duplicate content, not adding');
              return prev;
            }
            return [...prev, aiMessage];
          });

          // Add to message IDs
          setMessageIds(prev => new Set([...prev, aiMessage.id]));
        }
      }

      // If this was the first message, the title should have been updated
      // Force a refresh of the drawer conversations on next open
      if (wasFirstMessage) {
        // This will be picked up by the drawer's listener
        console.log('First message sent, title should be updated');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Don't show error message, just log it
      console.error('Failed to send message, not adding error to UI');
    } finally {
      setThinking(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AI</Text>
            </View>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessage : styles.aiMessage,
          ]}
        >
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  const ThinkingIndicator = () => (
    <View style={[styles.messageContainer, styles.aiMessageContainer]}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AI</Text>
        </View>
      </View>
      <View style={[styles.messageBubble, styles.aiMessage, styles.thinkingBubble]}>
        <ActivityIndicator size={20} color="#666" />
      </View>
    </View>
  );

  const EmptyChat = () => (
    <View style={styles.emptyChat}>
      <Ionicons name="sparkles" size={48} color="#FF5733" style={styles.logoIcon} />
      <Text style={styles.welcomeTitle}>¿Cómo puedo ayudarte hoy?</Text>
      <Text style={styles.welcomeSubtitle}>Pregúntame sobre cualquier tema escolar</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
        >
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Socrates AI</Text>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={() => {
            // Reset all state for new conversation
            setCurrentConversationId(null);
            setMessages([]);
            setIsFirstMessage(true);
            setMessageOffset(0);
            setHasMoreMessages(false); // Start as false
            setMessageIds(new Set()); // Clear message IDs
            createNewConversation();
          }}
        >
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={30} color="#007AFF" />
          </View>
        ) : messages.length === 0 && !thinking ? (
          // Show empty state when no messages
          <View style={styles.emptyChatContainer}>
            <EmptyChat />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => {
              // Only auto-scroll to end for new messages, not when loading older ones
              if (!loadingMore) {
                flatListRef.current?.scrollToEnd();
              }
            }}
            ListHeaderComponent={
              loadingMore ? (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size={20} color="#007AFF" />
                </View>
              ) : hasMoreMessages && messages.length > 0 ? (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMoreMessages}
                >
                  <Text style={styles.loadMoreText}>Cargar mensajes anteriores</Text>
                </TouchableOpacity>
              ) : null
            }
            ListFooterComponent={thinking ? <ThinkingIndicator /> : null}
            onScroll={({ nativeEvent }) => {
              // Auto-load more when scrolled to top
              if (nativeEvent.contentOffset.y <= 50 && hasMoreMessages && !loadingMore) {
                loadMoreMessages();
              }
            }}
            scrollEventThrottle={400}
            inverted={false}
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escribe tu pregunta..."
            placeholderTextColor="#999"
            multiline
            maxHeight={100}
            editable={!thinking}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || thinking) && styles.sendButtonDisabled]}
            onPress={() => {
              if (!thinking && inputText.trim()) {
                sendMessage();
              }
            }}
            disabled={!inputText.trim() || thinking}
          >
            <Ionicons
              name="send"
              size={20}
              color={!inputText.trim() || thinking ? '#CCC' : '#007AFF'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  newChatButton: {
    padding: 4,
  },
  chatContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userMessage: {
    backgroundColor: '#007AFF',
  },
  aiMessage: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  userMessageText: {
    color: '#FFF',
  },
  thinkingBubble: {
    paddingVertical: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F7F7F7',
    borderRadius: 20,
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChat: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoIcon: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingMoreContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});