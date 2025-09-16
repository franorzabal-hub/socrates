import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { supabase } from '@socrates/database';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [loading, setLoading] = useState(false);

  // DEVELOPMENT MODE - Bypass auth for testing
  const devModeLogin = async () => {
    try {
      setLoading(true);

      // Use fixed test user UUID that exists in database
      const testUserId = 'df5cf0d5-c064-482c-87df-6100a8475a60';
      await createUserProfile({
        id: testUserId,
        email: 'test@example.com',
        user_metadata: { full_name: 'Usuario de Prueba' }
      });

      // Set a fake session in local storage or state
      // This is just for testing UI flow
      onAuthSuccess();

    } catch (error) {
      console.error('Dev mode login error:', error);
      Alert.alert('Error', 'Error en modo desarrollo');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: AuthSession.makeRedirectUri({
            scheme: 'socrates',
          }),
        },
      });

      if (error) {
        Alert.alert('Error', 'No se pudo iniciar sesión con Google');
        return;
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          AuthSession.makeRedirectUri({ scheme: 'socrates' })
        );

        if (result.type === 'success' && result.url) {
          // Handle the redirect URL
          const params = new URLSearchParams(result.url.split('#')[1]);
          const accessToken = params.get('access_token');

          if (accessToken) {
            // Set the session
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: params.get('refresh_token') || '',
            });

            if (sessionData?.user) {
              // Create/update user profile
              await createUserProfile(sessionData.user);
              onAuthSuccess();
            }
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'Ocurrió un error durante el inicio de sesión');
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    // TODO: Implement Apple Sign In
    Alert.alert('Próximamente', 'El inicio de sesión con Apple estará disponible pronto');
  };

  const createUserProfile = async (user: any) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
        }),
      });

      if (!response.ok) {
        console.error('Failed to create user profile');
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🎓</Text>
          </View>
          <Text style={styles.title}>Socrates AI</Text>
          <Text style={styles.subtitle}>Tu tutor personal de aprendizaje</Text>
        </View>

        <View style={styles.authContainer}>
          <Text style={styles.welcomeText}>
            Bienvenido! Inicia sesión para comenzar tu aventura de aprendizaje
          </Text>

          {/* DEVELOPMENT MODE BUTTON */}
          <TouchableOpacity
            style={[styles.authButton, styles.devButton]}
            onPress={devModeLogin}
            disabled={loading}
          >
            <Ionicons name="bug" size={20} color="#FFF" />
            <Text style={styles.authButtonText}>Modo Desarrollo (Sin Auth)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authButton, styles.googleButton]}
            onPress={signInWithGoogle}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#FFF" />
            <Text style={styles.authButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authButton, styles.appleButton]}
            onPress={signInWithApple}
            disabled={loading}
          >
            <Ionicons name="logo-apple" size={20} color="#FFF" />
            <Text style={styles.authButtonText}>Continuar con Apple</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Al continuar, aceptas nuestros términos de servicio y política de privacidad
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  authContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  devButton: {
    backgroundColor: '#FF6B6B',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  authButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});