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
  const testUserId = 'df5cf0d5-c064-482c-87df-6100a8475a60'; // Fixed test user ID

  useEffect(() => {
    // Si recibimos un nuevo conversationId por params, lo usamos
    if (conversationId && conversationId !== currentConversationId) {
      setCurrentConversationId(conversationId);
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    if (currentConversationId) {
      fetchMessages();
    } else {
      createNewConversation();
    }
  }, [currentConversationId]);

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
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const fetchMessages = async () => {
    if (!currentConversationId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/conversations/${currentConversationId}`,
        {
          headers: {
            'x-user-id': testUserId, // TODO: Replace with actual user ID from auth
          },
        }
      );
      const data = await response.json();
      setMessages(data.conversation?.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !currentConversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText.trim(),
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setThinking(true);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: currentConversationId,
          userId: testUserId, // TODO: Replace with actual user ID from auth
        }),
      });

      const data = await response.json();

      if (data.message) {
        const aiMessage: Message = {
          id: data.messageId || Date.now().toString(),
          content: data.message,
          role: 'assistant',
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Show error message to user
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
            setCurrentConversationId(null);
            setMessages([]);
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
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.messagesList,
              messages.length === 0 && styles.emptyMessagesList,
            ]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            ListEmptyComponent={<EmptyChat />}
            ListFooterComponent={thinking ? <ThinkingIndicator /> : null}
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
            onPress={sendMessage}
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
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyMessagesList: {
    flex: 1,
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
});