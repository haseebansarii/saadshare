import createContextHook from '@nkzw/create-context-hook';
import * as SecureStore from 'expo-secure-store';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  language: 'en' | 'ja' | 'ko' | 'zh' | 'es' | 'it';
  photo_url?: string;
  organization_id: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
}

export interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => Promise<{ success: boolean; error?: string }>;
  pairWithCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  loginWithBiometric: () => Promise<{ success: boolean; error?: string }>;
  enableBiometric: () => Promise<{ success: boolean; error?: string }>;
  disableBiometric: () => Promise<{ success: boolean; error?: string }>;
  logout: (reason?: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  getRefreshToken: () => Promise<string | null>;
  reloadAuth: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
    biometricEnabled: false,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (state.isLoading) {
        console.warn('[Auth] Loading timeout - clearing loading state');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }, 3000);

    loadStoredAuth().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, []);

  const loadStoredAuth = async () => {
    try {
      console.log('[Auth] Loading stored authentication...');
      
      let token: string | null = null;
      let userJson: string | null = null;
      let biometricEnabledStr: string | null = null;
      
      if (Platform.OS === 'web') {
        token = localStorage.getItem(TOKEN_KEY);
        userJson = localStorage.getItem(USER_KEY);
        biometricEnabledStr = localStorage.getItem(BIOMETRIC_ENABLED_KEY);
      } else {
        token = await SecureStore.getItemAsync(TOKEN_KEY);
        userJson = await SecureStore.getItemAsync(USER_KEY);
        biometricEnabledStr = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      }
      
      if (token && userJson) {
        const user = JSON.parse(userJson);
        const biometricEnabled = biometricEnabledStr === 'true';
        
        setState({
          token,
          user,
          isLoading: false,
          isAuthenticated: true,
          biometricEnabled,
        });
        
        console.log('[Auth] Restored session for user:', user.id);
      } else {
        console.log('[Auth] No stored session found');
        setState({
          token: null,
          user: null,
          isLoading: false,
          isAuthenticated: false,
          biometricEnabled: false,
        });
      }
    } catch (error) {
      console.error('[Auth] Error loading stored auth:', error);
      setState({
        token: null,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        biometricEnabled: false,
      });
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('[Auth] Mock login for:', email);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUser: User = {
        id: 1,
        name: 'Demo User',
        email: email,
        age: 75,
        language: 'en',
        organization_id: 1,
      };
      
      const mockToken = 'mock_token_' + Date.now();
      const mockRefreshToken = 'mock_refresh_' + Date.now();
      
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, mockToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, mockRefreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, mockToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, mockRefreshToken);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(mockUser));
      }
      
      setState({
        token: mockToken,
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        biometricEnabled: state.biometricEnabled,
      });
      
      console.log('[Auth] Mock login successful');
      return { success: true };
    } catch (error) {
      console.error('[Auth] Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }, [state.biometricEnabled]);

  const loginWithBiometric = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    console.log('[Auth] Biometric authentication not implemented');
    return { success: false, error: 'Biometric authentication not available' };
  }, []);

  const enableBiometric = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    console.log('[Auth] Biometric not implemented');
    return { success: false, error: 'Biometric not available' };
  }, []);

  const logout = useCallback(async (reason?: string) => {
    try {
      if (reason) {
        console.log('[Auth] Logging out:', reason);
      } else {
        console.log('[Auth] Logging out...');
      }
      
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
      }

      setState({
        token: null,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        biometricEnabled: state.biometricEnabled,
      });

      console.log('[Auth] Logout successful');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    }
  }, [state.biometricEnabled]);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!state.user) return;

    const updatedUser = { ...state.user, ...updates };
    
    if (Platform.OS === 'web') {
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } else {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
    }

    setState(prev => ({ ...prev, user: updatedUser }));
    console.log('[Auth] User updated:', updatedUser);
  }, [state.user]);

  const getRefreshToken = useCallback(async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }, []);

  const pairWithCode = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('[Auth] Mock pairing with code');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (code.length !== 6) {
        return { success: false, error: 'Please enter a 6-digit code' };
      }
      
      const mockUser: User = {
        id: 1,
        name: 'Demo User',
        email: 'demo@app.com',
        age: 75,
        language: 'en',
        organization_id: 1,
      };
      
      const mockToken = 'mock_token_' + Date.now();
      const mockRefreshToken = 'mock_refresh_' + Date.now();
      
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, mockToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, mockRefreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, mockToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, mockRefreshToken);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(mockUser));
      }
      
      setState({
        token: mockToken,
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        biometricEnabled: state.biometricEnabled,
      });
      
      console.log('[Auth] Mock pairing successful');
      return { success: true };
    } catch (error) {
      console.error('[Auth] Pairing error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Pairing failed' 
      };
    }
  }, [state.biometricEnabled]);

  const disableBiometric = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    console.log('[Auth] Biometric not implemented');
    return { success: false, error: 'Biometric not available' };
  }, []);

  const reloadAuth = useCallback(async () => {
    await loadStoredAuth();
  }, []);

  const loginAsGuest = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    console.log('[Auth] Auto-login as guest user...');
    return await login('guest@app.com', 'password');
  }, [login]);

  return useMemo(() => ({
    ...state,
    login,
    loginAsGuest,
    pairWithCode,
    loginWithBiometric,
    enableBiometric,
    disableBiometric,
    logout,
    updateUser,
    getRefreshToken,
    reloadAuth,
  }), [state, login, loginAsGuest, pairWithCode, loginWithBiometric, enableBiometric, disableBiometric, logout, updateUser, getRefreshToken, reloadAuth]);
});
