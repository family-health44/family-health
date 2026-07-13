export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      doctor_types: {
        Row: {
          created_at: string | null
          family_group_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          family_group_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          family_group_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_types_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          family_group_id: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          type: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          family_group_id: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          type?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          family_group_id?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          doctor_id: string | null
          family_group_id: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          hidden: boolean | null
          id: string
          name: string
          person_id: string | null
          uploaded_at: string | null
          visit_id: string | null
        }
        Insert: {
          doctor_id?: string | null
          family_group_id?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          hidden?: boolean | null
          id?: string
          name: string
          person_id?: string | null
          uploaded_at?: string | null
          visit_id?: string | null
        }
        Update: {
          doctor_id?: string | null
          family_group_id?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          hidden?: boolean | null
          id?: string
          name?: string
          person_id?: string | null
          uploaded_at?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      family_group_members: {
        Row: {
          created_at: string | null
          family_group_id: string | null
          id: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          family_group_id?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          family_group_id?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_group_members_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_groups: {
        Row: {
          created_at: string | null
          id: string
          storage_cap_bytes: number
          name: string
          owner_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id?: string | null
          storage_cap_bytes?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          storage_cap_bytes?: number
        }
        Relationships: []
      }
      family_members: {
        Row: {
          created_at: string | null
          family_id: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          family_id: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          family_id?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      invites: {
        Row: {
          accepted: boolean | null
          created_at: string | null
          family_group_id: string | null
          id: string
          invited_by: string | null
          invited_email: string
        }
        Insert: {
          accepted?: boolean | null
          created_at?: string | null
          family_group_id?: string | null
          id?: string
          invited_by?: string | null
          invited_email: string
        }
        Update: {
          accepted?: boolean | null
          created_at?: string | null
          family_group_id?: string | null
          id?: string
          invited_by?: string | null
          invited_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          created_at: string | null
          dose_status: string | null
          family_group_id: string
          feeling: number | null
          id: string
          logged_date: string
          logged_time: string | null
          medication_id: string
          note: string | null
          person_id: string
          tags: string[] | null
        }
        Insert: {
          created_at?: string | null
          dose_status?: string | null
          family_group_id: string
          feeling?: number | null
          id?: string
          logged_date: string
          logged_time?: string | null
          medication_id: string
          note?: string | null
          person_id: string
          tags?: string[] | null
        }
        Update: {
          created_at?: string | null
          dose_status?: string | null
          family_group_id?: string
          feeling?: number | null
          id?: string
          logged_date?: string
          logged_time?: string | null
          medication_id?: string
          note?: string | null
          person_id?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string | null
          dosage: string | null
          end_date: string | null
          family_group_id: string
          form: string | null
          frequency: string | null
          id: string
          name: string
          next_refill: string | null
          notes: string | null
          person_id: string
          pharmacy: string | null
          prescribed_by: string | null
          reason: string | null
          repeats_left: number | null
          start_date: string | null
          status: string
          time_of_day: string | null
          with_food: string | null
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          family_group_id: string
          form?: string | null
          frequency?: string | null
          id?: string
          name: string
          next_refill?: string | null
          notes?: string | null
          person_id: string
          pharmacy?: string | null
          prescribed_by?: string | null
          reason?: string | null
          repeats_left?: number | null
          start_date?: string | null
          status?: string
          time_of_day?: string | null
          with_food?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          end_date?: string | null
          family_group_id?: string
          form?: string | null
          frequency?: string | null
          id?: string
          name?: string
          next_refill?: string | null
          notes?: string | null
          person_id?: string
          pharmacy?: string | null
          prescribed_by?: string | null
          reason?: string | null
          repeats_left?: number | null
          start_date?: string | null
          status?: string
          time_of_day?: string | null
          with_food?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medications_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medications_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medications_prescribed_by_fkey"
            columns: ["prescribed_by"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string | null
          doctor_id: string | null
          family_group_id: string
          hidden: boolean
          id: string
          medication_id: string | null
          note_date: string | null
          person_id: string | null
          updated_at: string | null
          visit_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          doctor_id?: string | null
          family_group_id: string
          hidden?: boolean
          id?: string
          medication_id?: string | null
          note_date?: string | null
          person_id?: string | null
          updated_at?: string | null
          visit_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          doctor_id?: string | null
          family_group_id?: string
          hidden?: boolean
          id?: string
          medication_id?: string | null
          note_date?: string | null
          person_id?: string | null
          updated_at?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          allergies: string | null
          blood_type: string | null
          created_at: string | null
          custom_sections: Json | null
          diagnoses: string | null
          dob: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          family_group_id: string
          health_fund: string | null
          health_fund_number: string | null
          id: string
          immunisations_current: boolean | null
          medicare_number: string | null
          name: string
          notes: string | null
        }
        Insert: {
          allergies?: string | null
          blood_type?: string | null
          created_at?: string | null
          custom_sections?: Json | null
          diagnoses?: string | null
          dob?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          family_group_id: string
          health_fund?: string | null
          health_fund_number?: string | null
          id?: string
          immunisations_current?: boolean | null
          medicare_number?: string | null
          name: string
          notes?: string | null
        }
        Update: {
          allergies?: string | null
          blood_type?: string | null
          created_at?: string | null
          custom_sections?: Json | null
          diagnoses?: string | null
          dob?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          family_group_id?: string
          health_fund?: string | null
          health_fund_number?: string | null
          id?: string
          immunisations_current?: boolean | null
          medicare_number?: string | null
          name?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "people_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      people_doctors: {
        Row: {
          doctor_id: string
          person_id: string
        }
        Insert: {
          doctor_id: string
          person_id: string
        }
        Update: {
          doctor_id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_doctors_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_doctors_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string | null
          doctor_id: string | null
          due_date: string | null
          family_group_id: string
          id: string
          notes: string | null
          person_id: string | null
          title: string
          visit_id: string | null
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          doctor_id?: string | null
          due_date?: string | null
          family_group_id: string
          id?: string
          notes?: string | null
          person_id?: string | null
          title: string
          visit_id?: string | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          doctor_id?: string | null
          due_date?: string | null
          family_group_id?: string
          id?: string
          notes?: string | null
          person_id?: string | null
          title?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "todos_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "todos_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "todos_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "todos_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          calendar_event_id: string | null
          created_at: string | null
          doctor_id: string | null
          family_group_id: string
          id: string
          notes: string | null
          out_of_pocket: number | null
          person_id: string
          post_notes: string | null
          pre_notes: string | null
          title: string
          total_cost: number | null
          visit_date: string
          visit_time: string | null
        }
        Insert: {
          calendar_event_id?: string | null
          created_at?: string | null
          doctor_id?: string | null
          family_group_id: string
          id?: string
          notes?: string | null
          out_of_pocket?: number | null
          person_id: string
          post_notes?: string | null
          pre_notes?: string | null
          title: string
          total_cost?: number | null
          visit_date: string
          visit_time?: string | null
        }
        Update: {
          calendar_event_id?: string | null
          created_at?: string | null
          doctor_id?: string | null
          family_group_id?: string
          id?: string
          notes?: string | null
          out_of_pocket?: number | null
          person_id?: string
          post_notes?: string | null
          pre_notes?: string | null
          title?: string
          total_cost?: number | null
          visit_date?: string
          visit_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_family_group: { Args: { group_name: string }; Returns: string }
      my_family_group_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
