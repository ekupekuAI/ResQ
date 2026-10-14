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
        .maybeSingle();
      
      if (error) {
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

      // Profile row is missing (e.g. sign-up needed email confirmation, so the insert had no session yet).
      // Create it now from the sign-up metadata so onboarding updates have a row to write to.
      if (!profile) {
        const meta = sessionUser.user_metadata || {};
        const { error: insertError } = await supabase.from('profiles').insert([{
          id: sessionUser.id,
          name: meta.name || sessionUser.email?.split('@')[0] || 'Resident',
          role: ['resident', 'admin', 'guard'].includes(meta.role) ? meta.role : 'resident'
        }]);
        if (insertError && insertError.code !== '23505') console.error('Error creating profile:', insertError);
        profile = await fetchProfile(sessionUser.id);
      }

      // Give them needsProfile: true if they signed up but no profile exists yet
      setUser(profile || { id: sessionUser.id, role: 'resident', needsProfile: true });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    let subscription;
    if (!supabase) {
      setLoading(false); // Not configured — App renders the setup screen
      return;
    }

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
      // Supabase calls made directly inside this callback can deadlock the auth client,
      // so the profile sync is deferred to the next tick.
      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'INITIAL_SESSION') return; // already handled by getSession above
        setTimeout(() => {
          syncUserSession(session?.user).catch(e => console.error("Auth state change error:", e));
        }, 0);
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

    // Email confirmation is on: no session yet, so RLS would reject the profile insert.
    // The profile is created on first login instead (see syncUserSession).
    if (data?.user && !data.session) {
      return { ...data, needsConfirmation: true };
    }

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
      .maybeSingle();
      
    if (error) throw error;
    // No row updated means the profile is missing — fail loudly instead of silently logging the user out
    if (!data) throw new Error('Your profile could not be found. Please log out and log in again.');
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout, loading, updateProfile }}>
      {loading
        ? <div className="min-h-screen flex items-center justify-center text-muted-foreground font-medium animate-pulse">Loading ResQ...</div>
        : children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
