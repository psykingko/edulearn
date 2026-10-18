import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Fetch the authoritative profile from the database
  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Failed to load profile:', error.message);
        setProfile(null);
        setAuthError(`Profile record could not be loaded: ${error.message}`);
      } else {
        setProfile(data);
        setAuthError(null);
      }
    } catch (err) {
      console.error('[AuthContext] Unexpected error fetching profile:', err);
      setProfile(null);
      setAuthError('An unexpected error occurred while loading your profile.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize session and attach listener
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          if (isMounted) {
            setAuthError(error.message);
            setIsLoading(false);
          }
          return;
        }

        if (initialSession?.user) {
          if (isMounted) {
            setUser(initialSession.user);
            setSession(initialSession);
          }
          await fetchProfile(initialSession.user.id);
        } else {
          if (isMounted) {
            setUser(null);
            setSession(null);
            setProfile(null);
            setIsLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setAuthError(err.message || 'Session initialization failed');
          setIsLoading(false);
        }
      }
    }

    initSession();

    // Listen for auth state events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (newSession?.user) {
          setUser(newSession.user);
          setSession(newSession);
          await fetchProfile(newSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setProfile(null);
        setAuthError(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  // Log in using Supabase email/password
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      setUser(data.user);
      setSession(data.session);
      await fetchProfile(data.user.id);
      return { success: true, user: data.user };
    } catch (err) {
      const msg = err.message || 'Login request failed. Please check your connection.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Sign up using Supabase email/password
  const signup = async ({ email, password, fullName, accountType = 'student' }) => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            requested_account_type: accountType,
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      // If session is active immediately (when email confirmation is off)
      if (data.session?.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id);
      }

      // If requesting instructor, record application
      if (accountType === 'instructor' && data.user && data.session) {
        try {
          await supabase.from('instructor_applications').insert({
            user_id: data.user.id,
            full_name: fullName.trim(),
            email: email.trim(),
            status: 'pending',
          });
        } catch (appErr) {
          console.warn('[AuthContext] Instructor application insert error:', appErr);
        }
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        requiresEmailConfirmation: !data.session,
        accountType,
      };
    } catch (err) {
      const msg = err.message || 'Registration request failed. Please check your connection.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Sign out and clear session
  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[AuthContext] Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setAuthError(null);
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    profile,
    role: profile?.role || null,
    isLoading,
    authError,
    login,
    signup,
    logout,
    refreshProfile: () => user && fetchProfile(user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
