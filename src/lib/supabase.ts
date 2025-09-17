import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour la base de données
export interface Database {
  public: {
    Tables: {
      budgets: {
        Row: {
          id: string;
          name: string;
          amount: number;
          category: string | null;
          room: string | null;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          amount: number;
          category?: string | null;
          room?: string | null;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          amount?: number;
          category?: string | null;
          room?: string | null;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          date: string;
          amount: number;
          category: string;
          room: string;
          supplier: string;
          description: string;
          invoice_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date?: string;
          amount: number;
          category: string;
          room: string;
          supplier: string;
          description: string;
          invoice_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          amount?: number;
          category?: string;
          room?: string;
          supplier?: string;
          description?: string;
          invoice_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}