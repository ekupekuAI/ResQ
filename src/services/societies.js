import { supabase } from '../lib/supabase';

export const getSocietyByCode = async (code) => {
  const { data, error } = await supabase
    .from('societies')
    .select('*')
    .eq('society_code', code)
    .maybeSingle();

  if (error) {
    console.error('Society code not found:', error);
    return null;
  }
  return data;
};

export const getSocietyById = async (id) => {
  const { data, error } = await supabase
    .from('societies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Society not found:', error);
    return null;
  }
  return data;
};

export const createSociety = async (name, address, code, adminId) => {
  const { data, error } = await supabase
    .from('societies')
    .insert([{ name, address, society_code: code, admin_id: adminId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSocietyMembers = async (societyId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('society_id', societyId)
    .neq('role', 'admin')
    .order('flat', { ascending: true });

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }
  return data || [];
};
