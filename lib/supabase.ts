import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Fallback for build-time safety
export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : {
        from: () => ({
            select: () => Promise.resolve({ data: [], error: null }),
            insert: () => Promise.resolve({ data: [], error: null }),
            update: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
            delete: () => ({ not: () => Promise.resolve({ data: [], error: null }), eq: () => Promise.resolve({ data: [], error: null }) }),
            upsert: () => Promise.resolve({ data: [], error: null })
        })
    } as any;
