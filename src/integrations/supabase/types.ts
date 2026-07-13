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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          doctor_id: string
          entity: string | null
          entity_id: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          created_at?: string
          doctor_id: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          created_at?: string
          doctor_id?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          acknowledged: boolean
          consultation_id: string | null
          created_at: string
          doctor_id: string
          id: string
          message: string | null
          patient_id: string | null
          severity: string
          title: string
          updated_at: string
        }
        Insert: {
          acknowledged?: boolean
          consultation_id?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          message?: string | null
          patient_id?: string | null
          severity?: string
          title: string
          updated_at?: string
        }
        Update: {
          acknowledged?: boolean
          consultation_id?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          message?: string | null
          patient_id?: string | null
          severity?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          audio_path: string | null
          chief_complaint: string | null
          created_at: string
          diagnosis: string | null
          doctor_id: string
          duration_seconds: number | null
          id: string
          language: string
          patient_id: string | null
          patient_name: string
          pdf_path: string | null
          soap_assessment: string | null
          soap_objective: string | null
          soap_plan: string | null
          soap_subjective: string | null
          status: string
          tags: string[] | null
          transcript: string | null
          updated_at: string
        }
        Insert: {
          audio_path?: string | null
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          duration_seconds?: number | null
          id?: string
          language?: string
          patient_id?: string | null
          patient_name: string
          pdf_path?: string | null
          soap_assessment?: string | null
          soap_objective?: string | null
          soap_plan?: string | null
          soap_subjective?: string | null
          status?: string
          tags?: string[] | null
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          audio_path?: string | null
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          duration_seconds?: number | null
          id?: string
          language?: string
          patient_id?: string | null
          patient_name?: string
          pdf_path?: string | null
          soap_assessment?: string | null
          soap_objective?: string | null
          soap_plan?: string | null
          soap_subjective?: string | null
          status?: string
          tags?: string[] | null
          transcript?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          created_at: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          name?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          age: number | null
          allergies: string | null
          blood_group: string | null
          contact: string | null
          created_at: string
          doctor_id: string
          email: string | null
          full_name: string
          gender: string | null
          id: string
          medical_history: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          allergies?: string | null
          blood_group?: string | null
          contact?: string | null
          created_at?: string
          doctor_id: string
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          medical_history?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          allergies?: string | null
          blood_group?: string | null
          contact?: string | null
          created_at?: string
          doctor_id?: string
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          medical_history?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          clinic: string | null
          created_at: string
          full_name: string | null
          hospital: string | null
          id: string
          notify_alerts: boolean | null
          notify_email: boolean | null
          phone: string | null
          preferred_language: string | null
          specialty: string | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          clinic?: string | null
          created_at?: string
          full_name?: string | null
          hospital?: string | null
          id: string
          notify_alerts?: boolean | null
          notify_email?: boolean | null
          phone?: string | null
          preferred_language?: string | null
          specialty?: string | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          clinic?: string | null
          created_at?: string
          full_name?: string | null
          hospital?: string | null
          id?: string
          notify_alerts?: boolean | null
          notify_email?: boolean | null
          phone?: string | null
          preferred_language?: string | null
          specialty?: string | null
          theme?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          consultation_id: string | null
          created_at: string
          doctor_id: string
          id: string
          kind: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          kind?: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          consultation_id?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          kind?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      soap_notes: {
        Row: {
          assessment: string | null
          consultation_id: string
          created_at: string
          doctor_id: string
          id: string
          medication: string | null
          objective: string | null
          payload: Json | null
          plan: string | null
          subjective: string | null
          summary: string | null
          updated_at: string
        }
        Insert: {
          assessment?: string | null
          consultation_id: string
          created_at?: string
          doctor_id: string
          id?: string
          medication?: string | null
          objective?: string | null
          payload?: Json | null
          plan?: string | null
          subjective?: string | null
          summary?: string | null
          updated_at?: string
        }
        Update: {
          assessment?: string | null
          consultation_id?: string
          created_at?: string
          doctor_id?: string
          id?: string
          medication?: string | null
          objective?: string | null
          payload?: Json | null
          plan?: string | null
          subjective?: string | null
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "soap_notes_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      transcript_versions: {
        Row: {
          consultation_id: string
          created_at: string
          doctor_id: string
          edited_by: string | null
          id: string
          note: string | null
          transcript: string
          version: number
        }
        Insert: {
          consultation_id: string
          created_at?: string
          doctor_id: string
          edited_by?: string | null
          id?: string
          note?: string | null
          transcript?: string
          version: number
        }
        Update: {
          consultation_id?: string
          created_at?: string
          doctor_id?: string
          edited_by?: string | null
          id?: string
          note?: string | null
          transcript?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "transcript_versions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "doctor"
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
    Enums: {
      app_role: ["admin", "doctor"],
    },
  },
} as const
