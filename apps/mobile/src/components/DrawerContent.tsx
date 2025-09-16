import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SettingsScreen from '../screens/SettingsScreen';

interface DrawerItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  action: () => void;
  color?: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function DrawerContent({ navigation, state }: any) {
  const [showSettings, setShowSettings] = useState(false);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [loadingRecents, setLoadingRecents] = useState(true);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const testUserId = 'df5cf0d5-c064-482c-87df-6100a8475a60';

  // Get current conversation ID from navigation params
  const currentRoute = state.routes[state.index];
  const currentConversationId = currentRoute?.params?.conversationId;

  useEffect(() => {
    // Reload conversations when drawer is opened
    const unsubscribe = navigation.addListener('drawerOpen', () => {
      fetchRecentConversations();
    });

    // Initial load
    fetchRecentConversations();

    return unsubscribe;
  }, [navigation]);

  const fetchRecentConversations = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/conversations?limit=10`,
        {
          headers: {
            'x-user-id': testUserId,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch conversations:', response.status);
        return;
      }

      const data = await response.json();
      if (data.conversations) {
        setRecentConversations(data.conversations.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching recent conversations:', error);
    } finally {
      setLoadingRecents(false);
    }
  };

  const openConversation = (conversationId: string) => {
    navigation.navigate('Chat', { conversationId });
    navigation.closeDrawer();
  };

  const handleLongPress = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowContextMenu(true);
  };

  const handleRename = async () => {
    if (!selectedConversation || !newTitle.trim()) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/conversations/${selectedConversation.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': testUserId,
          },
          body: JSON.stringify({ title: newTitle.trim() }),
        }
      );

      if (response.ok) {
        fetchRecentConversations();
        setShowRenameModal(false);
        setNewTitle('');
      }
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
  };

  const handleDelete = () => {
    if (!selectedConversation) return;

    Alert.alert(
      'Eliminar conversación',
      '¿Estás seguro de que quieres eliminar esta conversación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/api/conversations/${selectedConversation.id}`,
                {
                  method: 'DELETE',
                  headers: {
                    'x-user-id': testUserId,
                  },
                }
              );

              if (response.ok) {
                fetchRecentConversations();
                setShowContextMenu(false);
              }
            } catch (error) {
              console.error('Error deleting conversation:', error);
            }
          },
        },
      ]
    );
  };

  const drawerItems: DrawerItem[] = [
    {
      icon: 'chatbubbles-outline',
      label: 'Conversaciones',
      action: () => {
        navigation.navigate('ConversationsList');
        navigation.closeDrawer();
      },
    },
    {
      icon: 'book-outline',
      label: 'Materias',
      action: () => {
        // Future: Navigate to subjects
        navigation.closeDrawer();
      },
    },
    {
      icon: 'trophy-outline',
      label: 'Logros',
      action: () => {
        // Future: Navigate to achievements
        navigation.closeDrawer();
      },
    },
  ];

  const handleSettings = () => {
    setShowSettings(true);
    navigation.closeDrawer();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Socrates</Text>
      </View>

      <ScrollView style={styles.menuSection}>
        {drawerItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.drawerItem}
            onPress={item.action}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={item.color || '#333'}
              style={styles.icon}
            />
            <Text style={[styles.label, item.color && { color: item.color }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recientes</Text>
          {loadingRecents ? (
            <ActivityIndicator size="small" color="#999" style={{ padding: 10 }} />
          ) : recentConversations.length > 0 ? (
            <>
              {recentConversations.map((conversation) => {
                const isActive = conversation.id === currentConversationId;
                return (
                  <TouchableOpacity
                    key={conversation.id}
                    style={[styles.recentItem, isActive && styles.activeRecentItem]}
                    onPress={() => openConversation(conversation.id)}
                    onLongPress={() => handleLongPress(conversation)}
                  >
                    <Text style={[styles.recentText, isActive && styles.activeRecentText]} numberOfLines={1}>
                      {conversation.title || 'Conversación sin título'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={styles.allChatsLink}
                onPress={() => {
                  navigation.navigate('ConversationsList');
                  navigation.closeDrawer();
                }}
              >
                <Text style={styles.allChatsLinkText}>Ver todos los chats →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.noRecents}>No hay conversaciones recientes</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.userSection}
          onPress={handleSettings}
        >
          <View style={styles.userAvatar}>
            <Text style={styles.userInitials}>EA</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Estudiante Activo</Text>
            <Text style={styles.userSubtext}>Configuración</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SettingsScreen onClose={() => setShowSettings(false)} />
      </Modal>

      {/* Context Menu Modal */}
      <Modal
        visible={showContextMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowContextMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowContextMenu(false)}
        >
          <View style={styles.contextMenu}>
            <Text style={styles.contextMenuTitle} numberOfLines={1}>
              {selectedConversation?.title || 'Conversación sin título'}
            </Text>

            <TouchableOpacity
              style={styles.contextMenuItem}
              onPress={() => {
                // Star functionality - future implementation
                setShowContextMenu(false);
              }}
            >
              <Text style={styles.contextMenuText}>Star</Text>
              <Ionicons name="star-outline" size={20} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contextMenuItem}
              onPress={() => {
                setShowContextMenu(false);
                setNewTitle(selectedConversation?.title || '');
                setShowRenameModal(true);
              }}
            >
              <Text style={styles.contextMenuText}>Rename</Text>
              <Ionicons name="pencil-outline" size={20} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contextMenuItem, styles.contextMenuItemLast]}
              onPress={handleDelete}
            >
              <Text style={[styles.contextMenuText, styles.deleteText]}>Delete</Text>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Rename Modal */}
      <Modal
        visible={showRenameModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRenameModal(false)}
        >
          <View style={styles.renameModal} onStartShouldSetResponder={() => true}>
            <Text style={styles.renameTitle}>Renombrar conversación</Text>
            <TextInput
              style={styles.renameInput}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Nuevo título"
              autoFocus
            />
            <View style={styles.renameButtons}>
              <TouchableOpacity
                style={styles.renameButton}
                onPress={() => {
                  setShowRenameModal(false);
                  setNewTitle('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.renameButton, styles.saveButton]}
                onPress={handleRename}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  menuSection: {
    flex: 1,
    paddingTop: 10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  icon: {
    width: 30,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  recentSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  recentItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: -12,
    borderRadius: 8,
  },
  activeRecentItem: {
    backgroundColor: '#E8F0FE',
  },
  recentText: {
    fontSize: 14,
    color: '#333',
  },
  activeRecentText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitials: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  userName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  userSubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  noRecents: {
    fontSize: 14,
    color: '#999',
    paddingVertical: 8,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  allChatsLink: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  allChatsLinkText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenu: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '80%',
    maxWidth: 300,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  contextMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginBottom: 5,
  },
  contextMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  contextMenuItemLast: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    marginTop: 5,
    paddingTop: 15,
  },
  contextMenuText: {
    fontSize: 16,
    color: '#333',
  },
  deleteText: {
    color: '#FF3B30',
  },
  renameModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '80%',
    maxWidth: 300,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  renameTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  renameInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  renameButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  renameButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#333',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});