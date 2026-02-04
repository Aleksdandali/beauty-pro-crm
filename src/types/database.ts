export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      shops: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          role: 'owner' | 'admin' | 'master' | 'client';
          shop_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: 'owner' | 'admin' | 'master' | 'client';
          shop_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: 'owner' | 'admin' | 'master' | 'client';
          shop_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      salons: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          address: string | null;
          city: string | null;
          phone: string | null;
          email: string | null;
          currency: string;
          timezone: string;
          settings: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          address?: string | null;
          city?: string | null;
          phone?: string | null;
          email?: string | null;
          currency?: string;
          timezone?: string;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          address?: string | null;
          city?: string | null;
          phone?: string | null;
          email?: string | null;
          currency?: string;
          timezone?: string;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          salon_id: string;
          user_id: string;
          role: "owner" | "admin" | "staff";
          name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          specialization: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          user_id: string;
          role?: "owner" | "admin" | "staff";
          name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          specialization?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          user_id?: string;
          role?: "owner" | "admin" | "staff";
          name?: string;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          specialization?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          email: string | null;
          phone: string;
          birthday: string | null;
          notes: string | null;
          total_visits: number;
          total_spent: number;
          last_visit: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          name: string;
          email?: string | null;
          phone: string;
          birthday?: string | null;
          notes?: string | null;
          total_visits?: number;
          total_spent?: number;
          last_visit?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          name?: string;
          email?: string | null;
          phone?: string;
          birthday?: string | null;
          notes?: string | null;
          total_visits?: number;
          total_spent?: number;
          last_visit?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          description: string | null;
          duration: number;
          price: number;
          category: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          name: string;
          description?: string | null;
          duration: number;
          price: number;
          category?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          name?: string;
          description?: string | null;
          duration?: number;
          price?: number;
          category?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          salon_id: string;
          client_id: string;
          staff_id: string;
          service_id: string;
          start_time: string;
          end_time: string;
          status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
          notes: string | null;
          price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          client_id: string;
          staff_id: string;
          service_id: string;
          start_time: string;
          end_time: string;
          status?: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
          notes?: string | null;
          price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          client_id?: string;
          staff_id?: string;
          service_id?: string;
          start_time?: string;
          end_time?: string;
          status?: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
          notes?: string | null;
          price?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory_brands: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          slug: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          name: string;
          slug: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory_products: {
        Row: {
          id: string;
          salon_id: string;
          brand_id: string;
          name: string;
          sku: string | null;
          category: string | null;
          unit: string;
          quantity: number;
          min_quantity: number;
          cost_price: number;
          retail_price: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          brand_id: string;
          name: string;
          sku?: string | null;
          category?: string | null;
          unit?: string;
          quantity?: number;
          min_quantity?: number;
          cost_price: number;
          retail_price?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          brand_id?: string;
          name?: string;
          sku?: string | null;
          category?: string | null;
          unit?: string;
          quantity?: number;
          min_quantity?: number;
          cost_price?: number;
          retail_price?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory_transactions: {
        Row: {
          id: string;
          salon_id: string;
          product_id: string;
          type: "purchase" | "usage" | "adjustment" | "sale";
          quantity: number;
          unit_price: number;
          total_amount: number;
          notes: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          product_id: string;
          type: "purchase" | "usage" | "adjustment" | "sale";
          quantity: number;
          unit_price: number;
          total_amount: number;
          notes?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          product_id?: string;
          type?: "purchase" | "usage" | "adjustment" | "sale";
          quantity?: number;
          unit_price?: number;
          total_amount?: number;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_profile_if_not_exists: {
        Args: {
          p_full_name: string;
        };
        Returns: Database['public']['Tables']['profiles']['Row'];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
