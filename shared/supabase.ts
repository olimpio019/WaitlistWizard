import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is not defined');
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY is not defined');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function generateUploadUrl(filename: string) {
  const { data, error } = await supabase.storage
    .from('uploads')
    .createSignedUploadUrl(filename);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

export async function getPublicUrl(path: string) {
  const { data } = supabase.storage
    .from('uploads')
    .getPublicUrl(path);

  return data.publicUrl;
} 