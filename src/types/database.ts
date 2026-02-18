// src/types/database.ts
// TypeScript types for the Supabase database schema.
// Mirrors public.users table columns from 001_users_table.sql migration.
// Extended in 02-01 with quiz_sessions, quiz_questions, and topics tables.
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
      quiz_sessions: {
        Row: {
          id: string
          user_id: string
          topics: string[]
          difficulty: 'beginner' | 'normal' | 'advanced'
          question_types: string[]
          question_count: 5 | 10 | 20
          status: 'in_progress' | 'completed' | 'abandoned'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topics: string[]
          difficulty: 'beginner' | 'normal' | 'advanced'
          question_types: string[]
          question_count: 5 | 10 | 20
          status?: 'in_progress' | 'completed' | 'abandoned'
          created_at?: string
          updated_at?: string
        }
        Update: {
          topics?: string[]
          difficulty?: 'beginner' | 'normal' | 'advanced'
          question_types?: string[]
          question_count?: 5 | 10 | 20
          status?: 'in_progress' | 'completed' | 'abandoned'
          updated_at?: string
        }
      }
      quiz_questions: {
        Row: {
          id: string
          session_id: string
          question_index: number
          title: string
          body: string
          type: 'coding' | 'theoretical'
          difficulty: 'beginner' | 'normal' | 'advanced'
          topic: string
          expected_format: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question_index: number
          title: string
          body: string
          type: 'coding' | 'theoretical'
          difficulty: 'beginner' | 'normal' | 'advanced'
          topic: string
          expected_format?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          body?: string
          expected_format?: string | null
        }
      }
      topics: {
        Row: {
          id: string
          name: string
          category: 'language' | 'framework' | 'tool' | 'concept'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: 'language' | 'framework' | 'tool' | 'concept'
          created_at?: string
        }
        Update: {
          name?: string
          category?: 'language' | 'framework' | 'tool' | 'concept'
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

export type QuizSessionRow = Database['public']['Tables']['quiz_sessions']['Row']
export type QuizSessionInsert = Database['public']['Tables']['quiz_sessions']['Insert']
export type QuizQuestionRow = Database['public']['Tables']['quiz_questions']['Row']
export type QuizQuestionInsert = Database['public']['Tables']['quiz_questions']['Insert']
export type TopicRow = Database['public']['Tables']['topics']['Row']
