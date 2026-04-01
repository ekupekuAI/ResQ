import { supabase } from '../lib/supabase';

// Helper to keep local feed reactive outside of components
let subscribers = new Set();
export const subscribeToFeed = (callback) => {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
};

export const initRealtime = (societyId) => {
  const channel = supabase.channel('feed-updates')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts', filter: `society_id=eq.${societyId}` }, payload => {
      subscribers.forEach(cb => cb());
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements', filter: `society_id=eq.${societyId}` }, payload => {
      subscribers.forEach(cb => cb());
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'responses' }, payload => {
      subscribers.forEach(cb => cb());
    })
    .subscribe();
    
    return () => { supabase.removeChannel(channel) };
};

export const getFeed = async (societyId) => {
  if (!societyId) return [];

  const { data: alertsData, error: alErr } = await supabase
    .from('alerts')
    .select(`
      *,
      responses ( id, type )
    `)
    .eq('society_id', societyId)
    .order('created_at', { ascending: false });

  const { data: annData, error: anErr } = await supabase
    .from('announcements')
    .select('*')
    .eq('society_id', societyId)
    .order('created_at', { ascending: false });

  if (alErr || anErr) {
    console.error('Error fetching feed:', alErr, anErr);
    return [];
  }

  const combined = [
    ...(alertsData || []).map(a => ({ ...a, feedType: 'alert', help_count: a.responses?.filter(r => r.type === 'helping').length || 0 })),
    ...(annData || []).map(a => ({ ...a, feedType: 'announcement' }))
  ];
  
  // Sort reverse chronological
  combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return combined;
};

export const createAlert = async (alertData) => {
  const { data, error } = await supabase
    .from('alerts')
    .insert([alertData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const markAlertResolved = async (alertId) => {
  const { data, error } = await supabase
    .from('alerts')
    .update({ status: 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', alertId);

  if (error) throw error;
  return data;
};

export const respondToAlert = async (alertId, userId, type) => {
  const { data, error } = await supabase
    .from('responses')
    .insert([{ alert_id: alertId, user_id: userId, type }]);

  // Ignores unique constraint violations natively by error checking if needed
  if (error && error.code !== '23505') throw error; // 23505 is unique violation 
  return data;
};

export const createAnnouncement = async (societyId, sentBy, message) => {
  const { data, error } = await supabase
    .from('announcements')
    .insert([{ society_id: societyId, sent_by: sentBy, message }])
    .select()
    .single();

  if (error) throw error;
  return data;
};
