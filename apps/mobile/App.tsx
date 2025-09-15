import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from '@socrates/database';
import AuthScreen from './src/screens/AuthScreen';
import ConversationsList from './src/screens/ConversationsList';
import ChatScreen from './src/screens/ChatScreen';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false); // Changed to false for dev mode

  useEffect(() => {
    // Skip auth check in development
    // checkAuthStatus();
    // const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    //   setIsAuthenticated(!!session);
    // });

    // return () => {
    //   authListener?.subscription.unsubscribe();
    // };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size={30} color="#007AFF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <StatusBar style="auto" />
        <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />
      </>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="ConversationsList" component={ConversationsList} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
