export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          business_name: string | null
          business_email: string | null
          logo_url: string | null
          currency: string
          tax_rate: number | null
          payment_terms: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          business_name?: string | null
          business_email?: string | null
          logo_url?: string | null
          currency?: string
          tax_rate?: number | null
          payment_terms?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string | null
          business_email?: string | null
          logo_url?: string | null
          currency?: string
          tax_rate?: number | null
          payment_terms?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          company: string | null
          email: string
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          company?: string | null
          email: string
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          company?: string | null
          email?: string
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          client_id: string
          invoice_number: string
          status: InvoiceStatus
          issue_date: string
          due_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          invoice_number: string
          status?: InvoiceStatus
          issue_date?: string
          due_date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          invoice_number?: string
          status?: InvoiceStatus
          issue_date?: string
          due_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          rate: number
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity?: number
          rate?: number
          amount?: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          rate?: number
          amount?: number
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row']

export interface InvoiceWithDetails extends Invoice {
  client?: Client
  items: InvoiceItem[]
  total_amount?: number
}
