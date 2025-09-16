import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface SettingItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  hasArrow?: boolean;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

interface SettingsScreenProps {
  onClose?: () => void;
}

export default function SettingsScreen({ onClose }: SettingsScreenProps) {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const profileSettings: SettingItem[] = [
    {
      icon: 'person-outline',
      label: 'Perfil',
      hasArrow: true,
      onPress: () => {},
    },
    {
      icon: 'school-outline',
      label: 'Nivel educativo',
      value: 'Primaria',
      hasArrow: true,
      onPress: () => {},
    },
  ];

  const appSettings: SettingItem[] = [
    {
      icon: 'language-outline',
      label: 'Idioma',
      value: 'Español',
      hasArrow: true,
      onPress: () => {},
    },
    {
      icon: 'moon-outline',
      label: 'Apariencia',
      value: 'Sistema',
      hasArrow: true,
      onPress: () => {},
    },
    {
      icon: 'notifications-outline',
      label: 'Notificaciones',
      hasSwitch: true,
      switchValue: notificationsEnabled,
      onSwitchChange: setNotificationsEnabled,
    },
    {
      icon: 'volume-high-outline',
      label: 'Sonido',
      hasSwitch: true,
      switchValue: soundEnabled,
      onSwitchChange: setSoundEnabled,
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      icon: 'help-circle-outline',
      label: 'Ayuda y soporte',
      hasArrow: true,
      onPress: () => {},
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Privacidad',
      hasArrow: true,
      onPress: () => {},
    },
    {
      icon: 'document-text-outline',
      label: 'Términos de uso',
      hasArrow: true,
      onPress: () => {},
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.hasSwitch}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={item.icon} size={24} color="#333" style={styles.icon} />
        <Text style={styles.settingLabel}>{item.label}</Text>
      </View>
      <View style={styles.settingRight}>
        {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
        {item.hasArrow && (
          <Ionicons name="chevron-forward" size={20} color="#999" />
        )}
        {item.hasSwitch && (
          <Switch
            value={item.switchValue}
            onValueChange={item.onSwitchChange}
            trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
            thumbColor="#FFF"
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>Configuración</Text>
        <TouchableOpacity onPress={onClose || (() => navigation.goBack())} style={styles.closeButton}>
          <Text style={styles.closeText}>Listo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitials}>EA</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Estudiante Activo</Text>
            <Text style={styles.userEmail}>estudiante@ejemplo.com</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          {profileSettings.map(renderSettingItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aplicación</Text>
          {appSettings.map(renderSettingItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          {supportSettings.map(renderSettingItem)}
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Versión 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2025 Socrates AI</Text>
        </View>
      </ScrollView>
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
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 20,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInitials: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#FFF',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    width: 30,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#999',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 15,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 10,
    fontWeight: '500',
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
  },
});