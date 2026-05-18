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
      access_logs: {
        Row: {
          building_id: string
          checked_in_at: string
          checked_out_at: string | null
          created_at: string
          guard_id: string | null
          host_resident: string | null
          id: string
          id_number: string | null
          notes: string | null
          phone: string | null
          photo_url: string | null
          purpose: string | null
          temp_card_number: string | null
          tenant_id: string
          vehicle_plate: string | null
          visitor_name: string
          visitor_type: Database["public"]["Enums"]["visitor_type"]
        }
        Insert: {
          building_id: string
          checked_in_at?: string
          checked_out_at?: string | null
          created_at?: string
          guard_id?: string | null
          host_resident?: string | null
          id?: string
          id_number?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          purpose?: string | null
          temp_card_number?: string | null
          tenant_id: string
          vehicle_plate?: string | null
          visitor_name: string
          visitor_type?: Database["public"]["Enums"]["visitor_type"]
        }
        Update: {
          building_id?: string
          checked_in_at?: string
          checked_out_at?: string | null
          created_at?: string
          guard_id?: string | null
          host_resident?: string | null
          id?: string
          id_number?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          purpose?: string | null
          temp_card_number?: string | null
          tenant_id?: string
          vehicle_plate?: string | null
          visitor_name?: string
          visitor_type?: Database["public"]["Enums"]["visitor_type"]
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          tenant_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tenant_id: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          building_id: string | null
          created_at: string
          description: string
          id: string
          is_acknowledged: boolean
          tenant_id: string
          type: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          building_id?: string | null
          created_at?: string
          description: string
          id?: string
          is_acknowledged?: boolean
          tenant_id: string
          type: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          building_id?: string | null
          created_at?: string
          description?: string
          id?: string
          is_acknowledged?: boolean
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          author_id: string | null
          building_id: string | null
          content: string | null
          created_at: string
          expires_at: string | null
          id: string
          priority: string
          published_at: string | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          building_id?: string | null
          content?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          priority?: string
          published_at?: string | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          building_id?: string | null
          content?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          priority?: string
          published_at?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      buildings: {
        Row: {
          address: string | null
          created_at: string
          critical_incidents: number
          id: string
          incidents_today: number
          lat: number | null
          lng: number | null
          management_company: string | null
          name: string
          patrol_completion: number
          region: string | null
          sla_percent: number
          staff_online: number
          staff_total: number
          status: Database["public"]["Enums"]["building_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          critical_incidents?: number
          id?: string
          incidents_today?: number
          lat?: number | null
          lng?: number | null
          management_company?: string | null
          name: string
          patrol_completion?: number
          region?: string | null
          sla_percent?: number
          staff_online?: number
          staff_total?: number
          status?: Database["public"]["Enums"]["building_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          critical_incidents?: number
          id?: string
          incidents_today?: number
          lat?: number | null
          lng?: number | null
          management_company?: string | null
          name?: string
          patrol_completion?: number
          region?: string | null
          sla_percent?: number
          staff_online?: number
          staff_total?: number
          status?: Database["public"]["Enums"]["building_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buildings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          cert_name: string
          created_at: string
          document_url: string | null
          employee_id: string
          expiry_date: string | null
          id: string
          issued_date: string | null
          issuing_authority: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cert_name: string
          created_at?: string
          document_url?: string | null
          employee_id: string
          expiry_date?: string | null
          id?: string
          issued_date?: string | null
          issuing_authority?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cert_name?: string
          created_at?: string
          document_url?: string | null
          employee_id?: string
          expiry_date?: string | null
          id?: string
          issued_date?: string | null
          issuing_authority?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          channel: string
          created_at: string
          id: string
          message: string
          message_type: string
          sender_id: string | null
          tenant_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          message: string
          message_type?: string
          sender_id?: string | null
          tenant_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          sender_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      client_buildings: {
        Row: {
          building_id: string
          client_id: string
          id: string
        }
        Insert: {
          building_id: string
          client_id: string
          id?: string
        }
        Update: {
          building_id?: string
          client_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_buildings_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_buildings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          contact_person: string | null
          contract_end: string | null
          contract_start: string | null
          contract_status: Database["public"]["Enums"]["contract_status"]
          contract_value: number
          created_at: string
          email: string | null
          guards_count: number
          id: string
          last_contact_at: string | null
          name: string
          notes: string | null
          phone: string | null
          satisfaction: number
          sla: number
          status: Database["public"]["Enums"]["client_status"]
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          contact_person?: string | null
          contract_end?: string | null
          contract_start?: string | null
          contract_status?: Database["public"]["Enums"]["contract_status"]
          contract_value?: number
          created_at?: string
          email?: string | null
          guards_count?: number
          id?: string
          last_contact_at?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          satisfaction?: number
          sla?: number
          status?: Database["public"]["Enums"]["client_status"]
          tenant_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          contact_person?: string | null
          contract_end?: string | null
          contract_start?: string | null
          contract_status?: Database["public"]["Enums"]["contract_status"]
          contract_value?: number
          created_at?: string
          email?: string | null
          guards_count?: number
          id?: string
          last_contact_at?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          satisfaction?: number
          sla?: number
          status?: Database["public"]["Enums"]["client_status"]
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          building_id: string | null
          company_name: string
          contact_person: string | null
          contract_value: number | null
          created_at: string
          end_date: string | null
          id: string
          notes: string | null
          phone: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["contractor_status"]
          tenant_id: string
          updated_at: string
          work_type: string
        }
        Insert: {
          building_id?: string | null
          company_name: string
          contact_person?: string | null
          contract_value?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contractor_status"]
          tenant_id: string
          updated_at?: string
          work_type: string
        }
        Update: {
          building_id?: string | null
          company_name?: string
          contact_person?: string | null
          contract_value?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contractor_status"]
          tenant_id?: string
          updated_at?: string
          work_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractors_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_requests: {
        Row: {
          company: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string
          scale: string | null
          status: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone: string
          scale?: string | null
          status?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          scale?: string | null
          status?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          address: string | null
          building_id: string | null
          certifications: string[] | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          hire_date: string | null
          id: string
          id_number: string | null
          phone: string | null
          position: string
          salary: number | null
          status: Database["public"]["Enums"]["employee_status"]
          tenant_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          building_id?: string | null
          certifications?: string[] | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name: string
          hire_date?: string | null
          id?: string
          id_number?: string | null
          phone?: string | null
          position: string
          salary?: number | null
          status?: Database["public"]["Enums"]["employee_status"]
          tenant_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          building_id?: string | null
          certifications?: string[] | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          hire_date?: string | null
          id?: string
          id_number?: string | null
          phone?: string | null
          position?: string
          salary?: number | null
          status?: Database["public"]["Enums"]["employee_status"]
          tenant_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_timeline: {
        Row: {
          action: string
          created_at: string
          id: string
          incident_id: string
          new_status: string | null
          notes: string | null
          old_status: string | null
          performed_by: string | null
          tenant_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          incident_id: string
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          performed_by?: string | null
          tenant_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          incident_id?: string
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          performed_by?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_timeline_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_timeline_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_timeline_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          assignee_id: string | null
          building_id: string
          created_at: string
          description: string | null
          id: string
          reporter_id: string | null
          resolved_at: string | null
          response_time_minutes: number | null
          severity: Database["public"]["Enums"]["incident_severity"]
          status: Database["public"]["Enums"]["incident_status"]
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          building_id: string
          created_at?: string
          description?: string | null
          id?: string
          reporter_id?: string | null
          resolved_at?: string | null
          response_time_minutes?: number | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          tenant_id: string
          type: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          building_id?: string
          created_at?: string
          description?: string | null
          id?: string
          reporter_id?: string | null
          resolved_at?: string | null
          response_time_minutes?: number | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          paid_at: string | null
          status: string
          tax: number
          tenant_id: string
          total: number
          updated_at: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          paid_at?: string | null
          status?: string
          tax?: number
          tenant_id: string
          total?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_at?: string | null
          status?: string
          tax?: number
          tenant_id?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          employee_id: string
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          start_date: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id: string
          end_date: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      parcels: {
        Row: {
          building_id: string
          created_at: string
          id: string
          notes: string | null
          notified_at: string | null
          parcel_type: string | null
          picked_up_at: string | null
          received_at: string
          received_by: string | null
          resident_id: string | null
          sender: string | null
          status: Database["public"]["Enums"]["parcel_status"]
          tenant_id: string
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          building_id: string
          created_at?: string
          id?: string
          notes?: string | null
          notified_at?: string | null
          parcel_type?: string | null
          picked_up_at?: string | null
          received_at?: string
          received_by?: string | null
          resident_id?: string | null
          sender?: string | null
          status?: Database["public"]["Enums"]["parcel_status"]
          tenant_id: string
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          building_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          notified_at?: string | null
          parcel_type?: string | null
          picked_up_at?: string | null
          received_at?: string
          received_by?: string | null
          resident_id?: string | null
          sender?: string | null
          status?: Database["public"]["Enums"]["parcel_status"]
          tenant_id?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parcels_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcels_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patrol_checkpoints: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          name: string
          route_id: string
          sequence_order: number
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          name: string
          route_id: string
          sequence_order?: number
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          name?: string
          route_id?: string
          sequence_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "patrol_checkpoints_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "patrol_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      patrol_routes: {
        Row: {
          building_id: string
          completion: number
          created_at: string
          end_time: string | null
          guard_id: string | null
          id: string
          notes: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["patrol_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          building_id: string
          completion?: number
          created_at?: string
          end_time?: string | null
          guard_id?: string | null
          id?: string
          notes?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["patrol_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          building_id?: string
          completion?: number
          created_at?: string
          end_time?: string | null
          guard_id?: string | null
          id?: string
          notes?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["patrol_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patrol_routes_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrol_routes_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrol_routes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_records: {
        Row: {
          base_salary: number
          bonus: number
          created_at: string
          deductions: number
          employee_id: string
          id: string
          net_pay: number
          overtime: number
          paid_at: string | null
          period: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          base_salary?: number
          bonus?: number
          created_at?: string
          deductions?: number
          employee_id: string
          id?: string
          net_pay?: number
          overtime?: number
          paid_at?: string | null
          period: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          base_salary?: number
          bonus?: number
          created_at?: string
          deductions?: number
          employee_id?: string
          id?: string
          net_pay?: number
          overtime?: number
          paid_at?: string | null
          period?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_deals: {
        Row: {
          client_id: string | null
          contact: string | null
          created_at: string
          days_in_stage: number
          expected_close_date: string | null
          id: string
          name: string
          notes: string | null
          probability: number
          stage: Database["public"]["Enums"]["deal_stage"]
          tenant_id: string
          updated_at: string
          value: number
        }
        Insert: {
          client_id?: string | null
          contact?: string | null
          created_at?: string
          days_in_stage?: number
          expected_close_date?: string | null
          id?: string
          name: string
          notes?: string | null
          probability?: number
          stage?: Database["public"]["Enums"]["deal_stage"]
          tenant_id: string
          updated_at?: string
          value?: number
        }
        Update: {
          client_id?: string | null
          contact?: string | null
          created_at?: string
          days_in_stage?: number
          expected_close_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          probability?: number
          stage?: Database["public"]["Enums"]["deal_stage"]
          tenant_id?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_deals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          building_id: string | null
          content: string | null
          created_at: string
          id: string
          is_pinned: boolean
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          building_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          building_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_service_requests: {
        Row: {
          assigned_to: string | null
          building_id: string
          completed_at: string | null
          cost: number | null
          created_at: string
          description: string | null
          id: string
          resident_id: string | null
          scheduled_at: string | null
          service_type: string
          status: Database["public"]["Enums"]["request_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          building_id: string
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          resident_id?: string | null
          scheduled_at?: string | null
          service_type: string
          status?: Database["public"]["Enums"]["request_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          building_id?: string
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          resident_id?: string | null
          scheduled_at?: string | null
          service_type?: string
          status?: Database["public"]["Enums"]["request_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quick_service_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quick_service_requests_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quick_service_requests_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quick_service_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      residents: {
        Row: {
          apartment: string
          building_id: string
          created_at: string
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string
          id: string
          is_child_household: boolean
          is_elderly: boolean
          move_in_date: string | null
          phone: string | null
          special_notes: string | null
          status: string
          tenant_id: string
          updated_at: string
          user_id: string | null
          vehicle_plates: string[] | null
        }
        Insert: {
          apartment: string
          building_id: string
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name: string
          id?: string
          is_child_household?: boolean
          is_elderly?: boolean
          move_in_date?: string | null
          phone?: string | null
          special_notes?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          user_id?: string | null
          vehicle_plates?: string[] | null
        }
        Update: {
          apartment?: string
          building_id?: string
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string
          id?: string
          is_child_household?: boolean
          is_elderly?: boolean
          move_in_date?: string | null
          phone?: string | null
          special_notes?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string | null
          vehicle_plates?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "residents_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      service_plans: {
        Row: {
          billing_cycle: string
          created_at: string
          cta_text: string | null
          description: string | null
          features: Json
          id: string
          is_active: boolean
          is_popular: boolean
          name: string
          price: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          cta_text?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_popular?: boolean
          name: string
          price?: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          cta_text?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_popular?: boolean
          name?: string
          price?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      shift_schedules: {
        Row: {
          building_id: string
          created_at: string
          end_time: string
          id: string
          notes: string | null
          shift_date: string
          shift_type: string
          staff_member_id: string
          start_time: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          building_id: string
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          shift_date: string
          shift_type?: string
          staff_member_id: string
          start_time: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          building_id?: string
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          shift_date?: string
          shift_type?: string
          staff_member_id?: string
          start_time?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_schedules_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_schedules_staff_member_id_fkey"
            columns: ["staff_member_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_schedules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sos_calls: {
        Row: {
          building_id: string
          caller_name: string | null
          caller_phone: string | null
          created_at: string
          dispatched_guard_id: string | null
          id: string
          lat: number | null
          lng: number | null
          location_description: string | null
          notes: string | null
          resident_id: string | null
          resolved_at: string | null
          response_time_seconds: number | null
          status: Database["public"]["Enums"]["sos_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          building_id: string
          caller_name?: string | null
          caller_phone?: string | null
          created_at?: string
          dispatched_guard_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_description?: string | null
          notes?: string | null
          resident_id?: string | null
          resolved_at?: string | null
          response_time_seconds?: number | null
          status?: Database["public"]["Enums"]["sos_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          building_id?: string
          caller_name?: string | null
          caller_phone?: string | null
          created_at?: string
          dispatched_guard_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_description?: string | null
          notes?: string | null
          resident_id?: string | null
          resolved_at?: string | null
          response_time_seconds?: number | null
          status?: Database["public"]["Enums"]["sos_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_calls_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sos_calls_dispatched_guard_id_fkey"
            columns: ["dispatched_guard_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sos_calls_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sos_calls_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          building_id: string | null
          created_at: string
          employee_id: string | null
          id: string
          in_assigned_zone: boolean
          last_check_in: string | null
          name: string
          phone: string | null
          role: string
          status: Database["public"]["Enums"]["staff_status"]
          tenant_id: string
          updated_at: string
          user_id: string | null
          zone: string | null
        }
        Insert: {
          building_id?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          in_assigned_zone?: boolean
          last_check_in?: string | null
          name: string
          phone?: string | null
          role?: string
          status?: Database["public"]["Enums"]["staff_status"]
          tenant_id: string
          updated_at?: string
          user_id?: string | null
          zone?: string | null
        }
        Update: {
          building_id?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          in_assigned_zone?: boolean
          last_check_in?: string | null
          name?: string
          phone?: string | null
          role?: string
          status?: Database["public"]["Enums"]["staff_status"]
          tenant_id?: string
          updated_at?: string
          user_id?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      support_requests: {
        Row: {
          assignee_id: string | null
          building_id: string
          category: string | null
          created_at: string
          description: string | null
          id: string
          priority: Database["public"]["Enums"]["request_priority"]
          resident_id: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["request_status"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          building_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["request_priority"]
          resident_id?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          building_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["request_priority"]
          resident_id?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_requests_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_requests_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_requests_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      system_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          is_processed: boolean
          payload: Json
          tenant_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          is_processed?: boolean
          payload?: Json
          tenant_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          is_processed?: boolean
          payload?: Json
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_subscriptions: {
        Row: {
          billing_cycle: string
          canceled_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          notes: string | null
          plan: string
          price: number
          started_at: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          canceled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          plan?: string
          price?: number
          started_at?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          canceled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          plan?: string
          price?: number
          started_at?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          company_name: string
          created_at: string
          domain: string | null
          id: string
          is_active: boolean
          plan: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean
          plan?: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean
          plan?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      training_courses: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration_hours: number | null
          id: string
          is_mandatory: boolean
          pass_score: number | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_mandatory?: boolean
          pass_score?: number | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_mandatory?: boolean
          pass_score?: number | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_courses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      training_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          employee_id: string
          id: string
          score: number | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          employee_id: string
          id?: string
          score?: number | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          score?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_enrollments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zalo_groups: {
        Row: {
          admin_name: string | null
          admin_phone: string | null
          building_id: string | null
          created_at: string
          group_name: string
          id: string
          last_message: string | null
          last_message_at: string | null
          member_count: number
          qr_code_url: string | null
          status: string
          tenant_id: string
          unread_count: number
          updated_at: string
          zalo_link: string | null
        }
        Insert: {
          admin_name?: string | null
          admin_phone?: string | null
          building_id?: string | null
          created_at?: string
          group_name: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          member_count?: number
          qr_code_url?: string | null
          status?: string
          tenant_id: string
          unread_count?: number
          updated_at?: string
          zalo_link?: string | null
        }
        Update: {
          admin_name?: string | null
          admin_phone?: string | null
          building_id?: string | null
          created_at?: string
          group_name?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          member_count?: number
          qr_code_url?: string | null
          status?: string
          tenant_id?: string
          unread_count?: number
          updated_at?: string
          zalo_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zalo_groups_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zalo_groups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zalo_messages: {
        Row: {
          category: string | null
          created_at: string
          group_id: string
          id: string
          message_text: string
          message_type: string
          sender_name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          group_id: string
          id?: string
          message_text: string
          message_type?: string
          sender_name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          group_id?: string
          id?: string
          message_text?: string
          message_type?: string
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "zalo_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "zalo_groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_tenant_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_tenant_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _tenant_id: string
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "operator"
        | "guard"
        | "resident"
        | "hr_manager"
        | "finance_manager"
        | "platform_admin"
      building_status: "normal" | "warning" | "critical"
      client_status: "active" | "negotiating" | "prospect" | "churned"
      contract_status: "active" | "expiring" | "expired" | "draft"
      contractor_status: "active" | "completed" | "scheduled" | "suspended"
      deal_stage:
        | "lead"
        | "meeting"
        | "proposal"
        | "negotiation"
        | "closed"
        | "lost"
      employee_status: "active" | "probation" | "on_leave" | "terminated"
      incident_severity: "critical" | "high" | "medium" | "low"
      incident_status: "new" | "processing" | "resolved" | "escalated"
      parcel_status: "received" | "notified" | "picked_up" | "returned"
      patrol_status: "active" | "completed" | "missed" | "upcoming"
      request_priority: "high" | "medium" | "low"
      request_status: "open" | "in_progress" | "resolved" | "cancelled"
      sos_status: "pending" | "dispatched" | "resolved" | "false_alarm"
      staff_status: "on-patrol" | "stationary" | "offline"
      visitor_type: "guest" | "shipper" | "contractor" | "vip"
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
      app_role: [
        "admin",
        "operator",
        "guard",
        "resident",
        "hr_manager",
        "finance_manager",
        "platform_admin",
      ],
      building_status: ["normal", "warning", "critical"],
      client_status: ["active", "negotiating", "prospect", "churned"],
      contract_status: ["active", "expiring", "expired", "draft"],
      contractor_status: ["active", "completed", "scheduled", "suspended"],
      deal_stage: [
        "lead",
        "meeting",
        "proposal",
        "negotiation",
        "closed",
        "lost",
      ],
      employee_status: ["active", "probation", "on_leave", "terminated"],
      incident_severity: ["critical", "high", "medium", "low"],
      incident_status: ["new", "processing", "resolved", "escalated"],
      parcel_status: ["received", "notified", "picked_up", "returned"],
      patrol_status: ["active", "completed", "missed", "upcoming"],
      request_priority: ["high", "medium", "low"],
      request_status: ["open", "in_progress", "resolved", "cancelled"],
      sos_status: ["pending", "dispatched", "resolved", "false_alarm"],
      staff_status: ["on-patrol", "stationary", "offline"],
      visitor_type: ["guest", "shipper", "contractor", "vip"],
    },
  },
} as const
