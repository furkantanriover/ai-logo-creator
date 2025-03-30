import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useState, useEffect, useCallback, useMemo } from 'react';

export interface AuthState {
  initializing: boolean;
  user: FirebaseAuthTypes.User | null;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

export function useAuth(): AuthState {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle user state changes
  const onAuthStateChanged = useCallback(
    (user: FirebaseAuthTypes.User | null) => {
      setUser(user);
      if (initializing) setInitializing(false);
    },
    [initializing]
  );

  const signInAnonymously = useCallback(async () => {
    try {
      setError(null);
      await auth().signInAnonymously();
      console.log('User signed in anonymously');
    } catch (error: any) {
      const errorMessage = error.message || 'Anonim giriş yapılırken bir hata oluştu';

      if (error.code === 'auth/operation-not-allowed') {
        console.log('Enable anonymous in your firebase console.');
        setError('Anonim giriş devre dışı. Firebase konsolunda etkinleştirin.');
      } else {
        console.error('Auth error:', error);
        setError(errorMessage);
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      await auth().signOut();
      console.log('User signed out!');
    } catch (error: any) {
      const errorMessage = error.message || 'Çıkış yapılırken bir hata oluştu';
      console.error('Error signing out:', error);
      setError(errorMessage);
    }
  }, []);

  useEffect(() => {
    if (!initializing && !user) {
      signInAnonymously();
    }
  }, [initializing, user, signInAnonymously]);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

    return subscriber;
  }, [onAuthStateChanged]);

  return useMemo(
    () => ({
      initializing,
      user,
      signInAnonymously,
      signOut,
      error,
    }),
    [initializing, user, signInAnonymously, signOut, error]
  );
}
