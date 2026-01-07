import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role key
export function createServerClient() {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(supabaseUrl, supabaseServiceKey);
}

// Database types
export interface Project {
    id: string;
    name: string;
    created_at: string;
}

export interface KnowledgeItem {
    id: string;
    project_id: string;
    content: string | null;
    file_url: string | null;
    file_name: string | null;
    embedding: number[] | null;
    type: 'text' | 'audio' | 'pdf';
    status: 'processing' | 'indexed' | 'error';
    error_message: string | null;
    created_at: string;
}

export interface MatchDocument {
    id: string;
    content: string;
    similarity: number;
}
