import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the full profile row (role, name, mentor_details) from DB
  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*, mentor_details(*)')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
    return data;
  };

  useEffect(() => {
    // On mount: check for an existing session (localStorage)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen to all auth events (login, logout, token refresh, OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        // Don't setLoading(false) here — handled by getSession above
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /** Sign in with Google (OAuth redirect) */
  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });

  /** Sign in with email + password */
  const signInWithEmail = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  /** Create a new account */
  const signUp = (email, password, fullName, role) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } }
    });

  /** Sign out and clear state immediately */
  const signOut = async () => {
    setUser(null);
    setProfile(null);
    await supabase.auth.signOut();
  };

  /** Get the current session's access token for API calls */
  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signInWithGoogle, signInWithEmail, signUp, signOut,
      fetchProfile, getToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}
