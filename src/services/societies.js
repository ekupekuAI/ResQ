import { supabase } from '../lib/supabase';

export const getSocietyByCode = async (code) => {
  const { data, error } = await supabase
    .from('societies')
    .select('*')
    .eq('society_code', code)
    .single();

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
