import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch user profiles correctly
  const fetchProfile = async (authId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  };

  useEffect(() => {
    let subscription;
    
    const initAuth = async () => {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile || { id: session.user.id, role: 'resident', needsProfile: true });
      } else {
        setUser(null);
      }
      setLoading(false);

      // Listen for auth changes
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setUser(profile || { id: session.user.id, role: 'resident', needsProfile: true });
        } else {
          setUser(null);
        }
      });
      subscription = listener.subscription;
    };

    initAuth();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password, role) => {
    // Attempt Login First
    let { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    // If user doesn't exist, sign them up instantly
    if (error && error.message.includes('Invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      data = signUpData;

      // On new user signup, insert a profile based on requested role
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { id: data.user.id, name: email.split('@')[0], role: role }
          ]);
        if (profileError) throw profileError;
      }
    } else if (error) {
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Helper to update their profile after joining a society
  const updateProfile = async (updates) => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
      
    if (error) throw error;
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
