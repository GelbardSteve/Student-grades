import { useQueryClient } from '@tanstack/react-query';
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

const AuthContext = createContext(null);

// Holds the Supabase session for the whole app. Supabase Auth manages passwords, tokens and refresh.
export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      // Never show one admin's cached data to the next account
      if (!nextSession) queryClient.clear();
    });
    return () => listener.subscription.unsubscribe();
  }, [queryClient]);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, isLoading, signOut }),
    [session, isLoading, signOut]
  );
  return createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => useContext(AuthContext);
