import { useState, useEffect, useCallback } from 'react';
import { getSession, saveSession, clearSession, type UserSession } from '@/lib/db';

interface UseAuthReturn {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithCode: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async (initData: string) => {
    try {
      const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '';
      console.log('Fetching user data from:', `${API_BASE_URL}/api/user-data`);

      const response = await fetch(`${API_BASE_URL}/api/user-data`, {
        headers: {
          'x-telegram-init-data': initData,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Auth success:', result.user.telegram_id);
        const session: UserSession = {
          telegramUserId: result.user.telegram_id.toString(),
          username: result.user.username,
          firstName: result.user.first_name,
          lastName: result.user.last_name,
          authDate: new Date(),
          isAdmin: result.isAdmin
        };
        setUser(session);
        await saveSession(session);
        return true;
      }
      console.error('Auth failed with status:', response.status);
      return false;
    } catch (error) {
      console.error('Fetch user data error:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      // 1. Try Telegram WebApp
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initData) {
        const success = await fetchUserData(tg.initData);
        if (success) {
          setIsLoading(false);
          return;
        }
      }

      // 2. Try local session
      const session = await getSession();
      if (session) {
        setUser(session);
      }

      setIsLoading(false);
    };

    initAuth();
  }, [fetchUserData]);

  const loginWithCode = useCallback(async (code: string): Promise<boolean> => {
    // This is a fallback if needed, but for now we prioritize TMA initData
    return false;
  }, []);

  const logout = useCallback(async () => {
    try {
      await clearSession();
      setUser(null);
      console.log('Logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginWithCode,
    logout,
  };
}
