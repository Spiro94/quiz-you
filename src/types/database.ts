// src/types/database.ts
// TypeScript types for the Supabase database schema.
// Mirrors public.users table columns from 001_users_table.sql migration.
// Used to type the Supabase client: createClient<Database>(url, key)

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string           // UUID, primary key, references auth.users(id)
          email: string        // User's email address
          display_name: string | null  // Optional display name
          created_at: string   // ISO 8601 timestamp
          updated_at: string   // ISO 8601 timestamp, auto-updated
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience type aliases
export type UserRow = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']
