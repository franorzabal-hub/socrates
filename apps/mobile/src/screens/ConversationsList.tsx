import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface Conversation {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  messageCount: number;
}

export default function ConversationsList() {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      // TODO: Replace with actual user ID from auth
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/conversations`, {
        headers: {
          'x-user-id': 'test-user-id',
        },
      });
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Ayer';
    } else if (days < 7) {
      return `${days} días`;
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigation.navigate('Chat' as never, { conversationId: item.id } as never)}
    >
      <View style={styles.conversationContent}>
        <Text style={styles.conversationTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.conversationPreview} numberOfLines={2}>
          {item.preview || 'Nueva conversación'}
        </Text>
      </View>
      <View style={styles.conversationMeta}>
        <Text style={styles.conversationDate}>{formatDate(item.updatedAt)}</Text>
        {item.messageCount > 0 && (
          <View style={styles.messageBadge}>
            <Text style={styles.messageCount}>{item.messageCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color="#999" />
      <Text style={styles.emptyStateTitle}>No hay conversaciones</Text>
      <Text style={styles.emptyStateText}>
        Toca el botón + para iniciar una nueva conversación
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Socrates AI</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={<EmptyState />}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Chat' as never)}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  settingsButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  conversationContent: {
    flex: 1,
    marginRight: 12,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  conversationMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  conversationDate: {
    fontSize: 12,
    color: '#999',
  },
  messageBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  messageCount: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});