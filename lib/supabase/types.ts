export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          spreadsheet_id: string
          google_refresh_token: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          spreadsheet_id: string
          google_refresh_token?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          spreadsheet_id?: string
          google_refresh_token?: string | null
          created_at?: string
        }
      }
      endpoints: {
        Row: {
          id: string
          project_id: string
          sheet_name: string
          is_get_enabled: boolean
          is_post_enabled: boolean
          is_put_enabled: boolean
          is_delete_enabled: boolean
        }
        Insert: {
          id?: string
          project_id: string
          sheet_name: string
          is_get_enabled?: boolean
          is_post_enabled?: boolean
          is_put_enabled?: boolean
          is_delete_enabled?: boolean
        }
        Update: {
          id?: string
          project_id?: string
          sheet_name?: string
          is_get_enabled?: boolean
          is_post_enabled?: boolean
          is_put_enabled?: boolean
          is_delete_enabled?: boolean
        }
      }
      project_auth: {
        Row: {
          project_id: string
          auth_type: string
          auth_config: Json | null
        }
        Insert: {
          project_id: string
          auth_type?: string
          auth_config?: Json | null
        }
        Update: {
          project_id?: string
          auth_type?: string
          auth_config?: Json | null
        }
      }
    }
  }
}
