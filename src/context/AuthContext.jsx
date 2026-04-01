import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch user profiles correctly
  const fetchProfile = async (authId) => {
    try {
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
    } catch (e) {
      console.error('Exception fetching profile:', e);
      return null;
    }
  };

  const syncUserSession = async (sessionUser) => {
    if (sessionUser) {
      let profile = await fetchProfile(sessionUser.id);
      
      // AUTO STUCK-ADMIN REPAIR: Hard override for admin account if it got corrupted earlier
      if (sessionUser.email === 'gekansh2007@gmail.com' && (!profile || profile.role !== 'admin')) {
        console.log("Auto-repairing admin account role...");
        await supabase.from('profiles').upsert({
          id: sessionUser.id,
          role: 'admin',
          name: profile?.name || 'Admin'
        });
        profile = await fetchProfile(sessionUser.id); // Re-fetch the repaired profile
      }

      // Give them needsProfile: true if they signed up but no profile exists yet
      setUser(profile || { id: sessionUser.id, role: 'resident', needsProfile: true });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    let subscription;
    
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await syncUserSession(session?.user);
      } catch (e) {
        console.error("Init auth failed:", e);
      } finally {
        setLoading(false); // ALWAYS RUNS
      }

      // Listen for auth changes
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          await syncUserSession(session?.user);
        } catch (e) {
          console.error("Auth state change error:", e);
        }
      });
      subscription = listener.subscription;
    };

    initAuth();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (name, email, password, role) => {
    if (role === 'admin' && email.toLowerCase() !== 'gekansh2007@gmail.com') {
      throw new Error("Unauthorized: Only the designated owner (gekansh2007@gmail.com) can be an Admin.");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    });
    
    if (error) throw error;

    // Immediately create their profile in the database
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id, name, role }]);
        
      if (profileError) {
        // Fallback for duplicates or RLS
        if (profileError.code !== '23505') throw profileError; 
      }
    }
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

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
    <AuthContext.Provider value={{ user, login, signUp, logout, loading, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
