/**
 * Shine Beauty CRM — Database Types
 * Auto-matches the SQL schema in src/scripts/001-base-tables.sql
 *
 * Conventions:
 *   UUID  → string
 *   TIMESTAMPTZ → string (ISO 8601)
 *   DATE  → string (YYYY-MM-DD)
 *   TIME  → string (HH:MM:SS)
 *   NUMERIC → number
 *   JSONB → typed object or Record<string, unknown>
 *   TEXT[] → string[]
 *   INET  → string
 */

// ─── JSON Sub-types ──────────────────────────────────────────────────────────

export interface WorkingHoursDay {
  start: string;
  end: string;
}

export type WorkingHours = Record<
  'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
  WorkingHoursDay | null
>;

export interface ClientFormulas {
  nail?: Record<string, string>;
  hair?: Record<string, string>;
  allergies?: string[];
  preferences?: string;
  [key: string]: unknown;
}

export interface EquipmentParameters {
  temperature?: number;
  pressure?: number;
  time_minutes?: number;
  [key: string]: unknown;
}

// ─── Database Schema ─────────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      // ── 1. salons ──────────────────────────────────────────────
      salons: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          city: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          logo_url: string | null;
          cover_url: string | null;
          description: string | null;
          working_hours: WorkingHours;
          accent_color: string;
          currency: string;
          timezone: string;
          locale: string;
          telegram_bot_token: string | null;
          telegram_chat_id: string | null;
          subscription_plan: 'free' | 'pro' | 'business';
          subscription_expires_at: string | null;
          booking_enabled: boolean;
          booking_advance_days: number;
          booking_slot_duration: number;
          booking_confirmation_required: boolean;
          notifications_email: boolean;
          notifications_telegram: boolean;
          notifications_sms: boolean;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          city?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          description?: string | null;
          working_hours?: WorkingHours;
          accent_color?: string;
          currency?: string;
          timezone?: string;
          locale?: string;
          telegram_bot_token?: string | null;
          telegram_chat_id?: string | null;
          subscription_plan?: 'free' | 'pro' | 'business';
          subscription_expires_at?: string | null;
          booking_enabled?: boolean;
          booking_advance_days?: number;
          booking_slot_duration?: number;
          booking_confirmation_required?: boolean;
          notifications_email?: boolean;
          notifications_telegram?: boolean;
          notifications_sms?: boolean;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string | null;
          city?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          description?: string | null;
          working_hours?: WorkingHours;
          accent_color?: string;
          currency?: string;
          timezone?: string;
          locale?: string;
          telegram_bot_token?: string | null;
          telegram_chat_id?: string | null;
          subscription_plan?: 'free' | 'pro' | 'business';
          subscription_expires_at?: string | null;
          booking_enabled?: boolean;
          booking_advance_days?: number;
          booking_slot_duration?: number;
          booking_confirmation_required?: boolean;
          notifications_email?: boolean;
          notifications_telegram?: boolean;
          notifications_sms?: boolean;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ── 2. staff ───────────────────────────────────────────────
      staff: {
        Row: {
          id: string;
          salon_id: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          specialization: string | null;
          bio: string | null;
          slug: string | null;
          role: 'owner' | 'admin' | 'master' | 'intern';
          is_active: boolean;
          commission_rate: number;
          salary_fixed: number;
          auth_user_id: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          specialization?: string | null;
          bio?: string | null;
          slug?: string | null;
          role?: 'owner' | 'admin' | 'master' | 'intern';
          is_active?: boolean;
          commission_rate?: number;
          salary_fixed?: number;
          auth_user_id?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          specialization?: string | null;
          bio?: string | null;
          slug?: string | null;
          role?: 'owner' | 'admin' | 'master' | 'intern';
          is_active?: boolean;
          commission_rate?: number;
          salary_fixed?: number;
          auth_user_id?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ── 3. clients ─────────────────────────────────────────────
      clients: {
        Row: {
          id: string;
          salon_id: string;
          first_name: string;
          last_name: string | null;
          phone: string;
          email: string | null;
          avatar_url: string | null;
          birthday: string | null;
          notes: string | null;
          source: string;
          formulas: ClientFormulas;
          rfm_segment: 'vip' | 'loyal' | 'regular' | 'new' | 'sleeping' | 'lost';
          rfm_recency: number | null;
          rfm_frequency: number | null;
          rfm_monetary: number | null;
          rfm_updated_at: string | null;
          total_visits: number;
          total_spent: number;
          last_visit_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          first_name: string;
          last_name?: string | null;
          phone: string;
          email?: string | null;
          avatar_url?: string | null;
          birthday?: string | null;
          notes?: string | null;
          source?: string;
          formulas?: ClientFormulas;
          rfm_segment?: 'vip' | 'loyal' | 'regular' | 'new' | 'sleeping' | 'lost';
          rfm_recency?: number | null;
          rfm_frequency?: number | null;
          rfm_monetary?: number | null;
          rfm_updated_at?: string | null;
          total_visits?: number;
          total_spent?: number;
          last_visit_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          first_name?: string;
          last_name?: string | null;
          phone?: string;
          email?: string | null;
          avatar_url?: string | null;
          birthday?: string | null;
          notes?: string | null;
          source?: string;
          formulas?: ClientFormulas;
          rfm_segment?: 'vip' | 'loyal' | 'regular' | 'new' | 'sleeping' | 'lost';
          rfm_recency?: number | null;
          rfm_frequency?: number | null;
          rfm_monetary?: number | null;
          rfm_updated_at?: string | null;
          total_visits?: number;
          total_spent?: number;
          last_visit_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ── 4. services ────────────────────────────────────────────
      services: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          category: string;
          description: string | null;
          price: number;
          duration: number;
          cost: number;
          margin: number;
          color: string;
          icon: string | null;
          is_active: boolean;
          is_online_booking: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          name: string;
          category: string;
          description?: string | null;
          price: number;
          duration: number;
          cost?: number;
          margin?: number;
          color?: string;
          icon?: string | null;
          is_active?: boolean;
          is_online_booking?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          name?: string;
          category?: string;
          description?: string | null;
          price?: number;
          duration?: number;
          cost?: number;
          margin?: number;
          color?: string;
          icon?: string | null;
          is_active?: boolean;
          is_online_booking?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ── 5. staff_services ──────────────────────────────────────
      staff_services: {
        Row: {
          id: string;
          salon_id: string;
          staff_id: string;
          service_id: string;
          custom_price: number | null;
          custom_duration: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          staff_id: string;
          service_id: string;
          custom_price?: number | null;
          custom_duration?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          staff_id?: string;
          service_id?: string;
          custom_price?: number | null;
          custom_duration?: number | null;
          created_at?: string;
        };
      };

      // ── 6. staff_schedules ─────────────────────────────────────
      staff_schedules: {
        Row: {
          id: string;
          salon_id: string;
          staff_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          break_start: string | null;
          break_end: string | null;
          is_day_off: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          staff_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          break_start?: string | null;
          break_end?: string | null;
          is_day_off?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          staff_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          break_start?: string | null;
          break_end?: string | null;
          is_day_off?: boolean;
          created_at?: string;
        };
      };

      // ── 7. staff_time_off ──────────────────────────────────────
      staff_time_off: {
        Row: {
          id: string;
          salon_id: string;
          staff_id: string;
          start_date: string;
          end_date: string;
          reason: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          staff_id: string;
          start_date: string;
          end_date: string;
          reason?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          staff_id?: string;
          start_date?: string;
          end_date?: string;
          reason?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };

      // ── 8. appointments ────────────────────────────────────────
      appointments: {
        Row: {
          id: string;
          salon_id: string;
          client_id: string;
          staff_id: string;
          service_id: string;
          start_time: string;
          end_time: string;
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
          price: number;
          discount: number;
          final_price: number | null;
          notes: string | null;
          client_notes: string | null;
          formula_snapshot: Record<string, unknown> | null;
          materials_deducted: boolean;
          source: 'manual' | 'online' | 'telegram' | 'phone';
          payment_method: 'cash' | 'card' | 'transfer' | 'mixed' | null;
          payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
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
          status?:
            | 'scheduled'
            | 'confirmed'
            | 'in_progress'
            | 'completed'
            | 'cancelled'
            | 'no_show';
          price: number;
          discount?: number;
          final_price?: number | null;
          notes?: string | null;
          client_notes?: string | null;
          formula_snapshot?: Record<string, unknown> | null;
          materials_deducted?: boolean;
          source?: 'manual' | 'online' | 'telegram' | 'phone';
          payment_method?: 'cash' | 'card' | 'transfer' | 'mixed' | null;
          payment_status?: 'pending' | 'paid' | 'partial' | 'refunded';
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
          status?:
            | 'scheduled'
            | 'confirmed'
            | 'in_progress'
            | 'completed'
            | 'cancelled'
            | 'no_show';
          price?: number;
          discount?: number;
          final_price?: number | null;
          notes?: string | null;
          client_notes?: string | null;
          formula_snapshot?: Record<string, unknown> | null;
          materials_deducted?: boolean;
          source?: 'manual' | 'online' | 'telegram' | 'phone';
          payment_method?: 'cash' | 'card' | 'transfer' | 'mixed' | null;
          payment_status?: 'pending' | 'paid' | 'partial' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
      };

      // ── 9a. inventory_brands ───────────────────────────────────
      inventory_brands: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          logo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          name: string;
          logo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          name?: string;
          logo_url?: string | null;
          created_at?: string;
        };
      };

      // ── 9b. inventory_items ─────────────────────────────────
      inventory_items: {
        Row: {
          id: string;
          salon_id: string;
          brand_id: string | null;
          name: string;
          sku: string | null;
          category: string | null;
          unit: 'шт' | 'мл' | 'г' | 'упак';
          quantity: number;
          min_quantity: number;
          purchase_price: number;
          retail_price: number;
          usage_per_service: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          brand_id?: string | null;
          name: string;
          sku?: string | null;
          category?: string | null;
          unit?: 'шт' | 'мл' | 'г' | 'упак';
          quantity?: number;
          min_quantity?: number;
          purchase_price?: number;
          retail_price?: number;
          usage_per_service?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          brand_id?: string | null;
          name?: string;
          sku?: string | null;
          category?: string | null;
          unit?: 'шт' | 'мл' | 'г' | 'упак';
          quantity?: number;
          min_quantity?: number;
          purchase_price?: number;
          retail_price?: number;
          usage_per_service?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ── 9c. inventory_transactions ─────────────────────────────
      inventory_transactions: {
        Row: {
          id: string;
          salon_id: string;
          product_id: string;
          type: 'purchase' | 'usage' | 'adjustment' | 'return' | 'auto_deduction';
          quantity: number;
          appointment_id: string | null;
          staff_id: string | null;
          notes: string | null;
          cost: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          product_id: string;
          type: 'purchase' | 'usage' | 'adjustment' | 'return' | 'auto_deduction';
          quantity: number;
          appointment_id?: string | null;
          staff_id?: string | null;
          notes?: string | null;
          cost?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          product_id?: string;
          type?: 'purchase' | 'usage' | 'adjustment' | 'return' | 'auto_deduction';
          quantity?: number;
          appointment_id?: string | null;
          staff_id?: string | null;
          notes?: string | null;
          cost?: number | null;
          created_at?: string;
        };
      };

      // ── 10. service_materials ──────────────────────────────────
      service_materials: {
        Row: {
          id: string;
          salon_id: string;
          service_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          service_id: string;
          product_id: string;
          quantity: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          service_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
        };
      };

      // ── 11. work_photos ────────────────────────────────────────
      work_photos: {
        Row: {
          id: string;
          salon_id: string;
          staff_id: string | null;
          client_id: string | null;
          appointment_id: string | null;
          service_id: string | null;
          photo_url: string;
          thumbnail_url: string | null;
          description: string | null;
          tags: string[] | null;
          is_portfolio: boolean;
          is_public: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          staff_id?: string | null;
          client_id?: string | null;
          appointment_id?: string | null;
          service_id?: string | null;
          photo_url: string;
          thumbnail_url?: string | null;
          description?: string | null;
          tags?: string[] | null;
          is_portfolio?: boolean;
          is_public?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          staff_id?: string | null;
          client_id?: string | null;
          appointment_id?: string | null;
          service_id?: string | null;
          photo_url?: string;
          thumbnail_url?: string | null;
          description?: string | null;
          tags?: string[] | null;
          is_portfolio?: boolean;
          is_public?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };

      // ── 12. expenses ───────────────────────────────────────────
      expenses: {
        Row: {
          id: string;
          salon_id: string;
          category:
            | 'rent'
            | 'utilities'
            | 'materials'
            | 'salary'
            | 'marketing'
            | 'equipment'
            | 'tax'
            | 'other';
          amount: number;
          description: string | null;
          date: string;
          receipt_url: string | null;
          is_recurring: boolean;
          recurring_period: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null;
          staff_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          category:
            | 'rent'
            | 'utilities'
            | 'materials'
            | 'salary'
            | 'marketing'
            | 'equipment'
            | 'tax'
            | 'other';
          amount: number;
          description?: string | null;
          date?: string;
          receipt_url?: string | null;
          is_recurring?: boolean;
          recurring_period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null;
          staff_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          category?:
            | 'rent'
            | 'utilities'
            | 'materials'
            | 'salary'
            | 'marketing'
            | 'equipment'
            | 'tax'
            | 'other';
          amount?: number;
          description?: string | null;
          date?: string;
          receipt_url?: string | null;
          is_recurring?: boolean;
          recurring_period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null;
          staff_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ── 13. payroll ────────────────────────────────────────────
      payroll: {
        Row: {
          id: string;
          salon_id: string;
          staff_id: string;
          period_start: string;
          period_end: string;
          total_revenue: number;
          commission_amount: number;
          salary_fixed: number;
          bonus: number;
          deductions: number;
          total_amount: number;
          appointments_count: number;
          status: 'draft' | 'approved' | 'paid';
          paid_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          staff_id: string;
          period_start: string;
          period_end: string;
          total_revenue?: number;
          commission_amount?: number;
          salary_fixed?: number;
          bonus?: number;
          deductions?: number;
          total_amount?: number;
          appointments_count?: number;
          status?: 'draft' | 'approved' | 'paid';
          paid_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          staff_id?: string;
          period_start?: string;
          period_end?: string;
          total_revenue?: number;
          commission_amount?: number;
          salary_fixed?: number;
          bonus?: number;
          deductions?: number;
          total_amount?: number;
          appointments_count?: number;
          status?: 'draft' | 'approved' | 'paid';
          paid_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ── 14a. service_packages ──────────────────────────────────
      service_packages: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          description: string | null;
          price: number;
          original_price: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          name: string;
          description?: string | null;
          price: number;
          original_price?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          original_price?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ── 14b. service_package_items ─────────────────────────────
      service_package_items: {
        Row: {
          id: string;
          package_id: string;
          service_id: string;
          salon_id: string;
        };
        Insert: {
          id?: string;
          package_id: string;
          service_id: string;
          salon_id: string;
        };
        Update: {
          id?: string;
          package_id?: string;
          service_id?: string;
          salon_id?: string;
        };
      };

      // ── 15a. message_templates ─────────────────────────────────
      message_templates: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          type:
            | 'reminder'
            | 'confirmation'
            | 'cancellation'
            | 'birthday'
            | 'reactivation'
            | 'review'
            | 'custom';
          channel: 'sms' | 'telegram' | 'email';
          subject: string | null;
          body: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          name: string;
          type:
            | 'reminder'
            | 'confirmation'
            | 'cancellation'
            | 'birthday'
            | 'reactivation'
            | 'review'
            | 'custom';
          channel: 'sms' | 'telegram' | 'email';
          subject?: string | null;
          body: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          name?: string;
          type?:
            | 'reminder'
            | 'confirmation'
            | 'cancellation'
            | 'birthday'
            | 'reactivation'
            | 'review'
            | 'custom';
          channel?: 'sms' | 'telegram' | 'email';
          subject?: string | null;
          body?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };

      // ── 15b. notification_log ──────────────────────────────────
      notification_log: {
        Row: {
          id: string;
          salon_id: string;
          template_id: string | null;
          client_id: string | null;
          appointment_id: string | null;
          channel: string;
          recipient: string;
          message: string;
          status: 'pending' | 'sent' | 'delivered' | 'failed';
          sent_at: string | null;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          template_id?: string | null;
          client_id?: string | null;
          appointment_id?: string | null;
          channel: string;
          recipient: string;
          message: string;
          status?: 'pending' | 'sent' | 'delivered' | 'failed';
          sent_at?: string | null;
          error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          template_id?: string | null;
          client_id?: string | null;
          appointment_id?: string | null;
          channel?: string;
          recipient?: string;
          message?: string;
          status?: 'pending' | 'sent' | 'delivered' | 'failed';
          sent_at?: string | null;
          error?: string | null;
          created_at?: string;
        };
      };

      // ── 16a. sterilization_equipment ───────────────────────────
      sterilization_equipment: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          type: 'autoclave' | 'dry_heat' | 'uv' | 'ultrasonic' | 'glass_bead';
          brand: string | null;
          model: string | null;
          serial_number: string | null;
          parameters: EquipmentParameters;
          certification_number: string | null;
          certification_expires_at: string | null;
          purchase_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          name: string;
          type: 'autoclave' | 'dry_heat' | 'uv' | 'ultrasonic' | 'glass_bead';
          brand?: string | null;
          model?: string | null;
          serial_number?: string | null;
          parameters?: EquipmentParameters;
          certification_number?: string | null;
          certification_expires_at?: string | null;
          purchase_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          name?: string;
          type?: 'autoclave' | 'dry_heat' | 'uv' | 'ultrasonic' | 'glass_bead';
          brand?: string | null;
          model?: string | null;
          serial_number?: string | null;
          parameters?: EquipmentParameters;
          certification_number?: string | null;
          certification_expires_at?: string | null;
          purchase_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ── 16b. sterilization_instrument_sets ─────────────────────
      sterilization_instrument_sets: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          category: string;
          instruments: string[];
          quantity: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          name: string;
          category?: string;
          instruments: string[];
          quantity?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          name?: string;
          category?: string;
          instruments?: string[];
          quantity?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };

      // ── 16c. sterilization_cycles ──────────────────────────────
      sterilization_cycles: {
        Row: {
          id: string;
          salon_id: string;
          cycle_number: string;
          equipment_id: string | null;
          instrument_set_id: string | null;
          staff_id: string | null;
          status: 'started' | 'disinfection' | 'pso' | 'sterilization' | 'completed' | 'failed';
          started_at: string;
          disinfection_started_at: string | null;
          disinfection_completed_at: string | null;
          disinfection_solution: string | null;
          disinfection_exposure_minutes: number | null;
          pso_started_at: string | null;
          pso_completed_at: string | null;
          pso_method: string | null;
          azopyramine_test: 'positive' | 'negative' | 'not_done' | null;
          azopyramine_photo_url: string | null;
          sterilization_started_at: string | null;
          sterilization_completed_at: string | null;
          sterilization_temperature: number | null;
          sterilization_pressure: number | null;
          sterilization_time_minutes: number | null;
          chemical_indicator: 'passed' | 'failed' | 'not_used' | null;
          chemical_indicator_photo_url: string | null;
          packaging_type: string | null;
          package_label: string | null;
          photos_before: string[] | null;
          photos_after: string[] | null;
          result: 'sterile' | 'failed' | 'repeat_required' | null;
          notes: string | null;
          is_locked: boolean;
          locked_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          cycle_number?: string;
          equipment_id?: string | null;
          instrument_set_id?: string | null;
          staff_id?: string | null;
          status?: 'started' | 'disinfection' | 'pso' | 'sterilization' | 'completed' | 'failed';
          started_at?: string;
          disinfection_started_at?: string | null;
          disinfection_completed_at?: string | null;
          disinfection_solution?: string | null;
          disinfection_exposure_minutes?: number | null;
          pso_started_at?: string | null;
          pso_completed_at?: string | null;
          pso_method?: string | null;
          azopyramine_test?: 'positive' | 'negative' | 'not_done' | null;
          azopyramine_photo_url?: string | null;
          sterilization_started_at?: string | null;
          sterilization_completed_at?: string | null;
          sterilization_temperature?: number | null;
          sterilization_pressure?: number | null;
          sterilization_time_minutes?: number | null;
          chemical_indicator?: 'passed' | 'failed' | 'not_used' | null;
          chemical_indicator_photo_url?: string | null;
          packaging_type?: string | null;
          package_label?: string | null;
          photos_before?: string[] | null;
          photos_after?: string[] | null;
          result?: 'sterile' | 'failed' | 'repeat_required' | null;
          notes?: string | null;
          is_locked?: boolean;
          locked_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          cycle_number?: string;
          equipment_id?: string | null;
          instrument_set_id?: string | null;
          staff_id?: string | null;
          status?: 'started' | 'disinfection' | 'pso' | 'sterilization' | 'completed' | 'failed';
          started_at?: string;
          disinfection_started_at?: string | null;
          disinfection_completed_at?: string | null;
          disinfection_solution?: string | null;
          disinfection_exposure_minutes?: number | null;
          pso_started_at?: string | null;
          pso_completed_at?: string | null;
          pso_method?: string | null;
          azopyramine_test?: 'positive' | 'negative' | 'not_done' | null;
          azopyramine_photo_url?: string | null;
          sterilization_started_at?: string | null;
          sterilization_completed_at?: string | null;
          sterilization_temperature?: number | null;
          sterilization_pressure?: number | null;
          sterilization_time_minutes?: number | null;
          chemical_indicator?: 'passed' | 'failed' | 'not_used' | null;
          chemical_indicator_photo_url?: string | null;
          packaging_type?: string | null;
          package_label?: string | null;
          photos_before?: string[] | null;
          photos_after?: string[] | null;
          result?: 'sterile' | 'failed' | 'repeat_required' | null;
          notes?: string | null;
          is_locked?: boolean;
          locked_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ── 16d. sterilization_storage ─────────────────────────────
      sterilization_storage: {
        Row: {
          id: string;
          salon_id: string;
          cycle_id: string;
          package_label: string;
          instrument_set_id: string | null;
          sterilized_at: string;
          expires_at: string;
          status: 'sterile' | 'used' | 'expired';
          used_at: string | null;
          used_by: string | null;
          used_for_appointment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          cycle_id: string;
          package_label: string;
          instrument_set_id?: string | null;
          sterilized_at: string;
          expires_at: string;
          status?: 'sterile' | 'used' | 'expired';
          used_at?: string | null;
          used_by?: string | null;
          used_for_appointment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          cycle_id?: string;
          package_label?: string;
          instrument_set_id?: string | null;
          sterilized_at?: string;
          expires_at?: string;
          status?: 'sterile' | 'used' | 'expired';
          used_at?: string | null;
          used_by?: string | null;
          used_for_appointment?: string | null;
          created_at?: string;
        };
      };

      // ── 16e. equipment_maintenance ─────────────────────────────
      equipment_maintenance: {
        Row: {
          id: string;
          salon_id: string;
          equipment_id: string;
          type: 'calibration' | 'repair' | 'inspection' | 'certification' | 'cleaning';
          date: string;
          next_date: string | null;
          cost: number | null;
          document_url: string | null;
          notes: string | null;
          performed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          equipment_id: string;
          type: 'calibration' | 'repair' | 'inspection' | 'certification' | 'cleaning';
          date: string;
          next_date?: string | null;
          cost?: number | null;
          document_url?: string | null;
          notes?: string | null;
          performed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          equipment_id?: string;
          type?: 'calibration' | 'repair' | 'inspection' | 'certification' | 'cleaning';
          date?: string;
          next_date?: string | null;
          cost?: number | null;
          document_url?: string | null;
          notes?: string | null;
          performed_by?: string | null;
          created_at?: string;
        };
      };

      // ── 17. activity_log ───────────────────────────────────────
      activity_log: {
        Row: {
          id: string;
          salon_id: string;
          user_id: string | null;
          staff_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Record<string, unknown> | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          user_id?: string | null;
          staff_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          salon_id?: string;
          user_id?: string | null;
          staff_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
  };
};

// ─── Convenience Aliases ─────────────────────────────────────────────────────

type Tables = Database['public']['Tables'];

export type Salon = Tables['salons']['Row'];
export type SalonInsert = Tables['salons']['Insert'];
export type SalonUpdate = Tables['salons']['Update'];

export type Staff = Tables['staff']['Row'];
export type StaffInsert = Tables['staff']['Insert'];
export type StaffUpdate = Tables['staff']['Update'];

export type Client = Tables['clients']['Row'];
export type ClientInsert = Tables['clients']['Insert'];
export type ClientUpdate = Tables['clients']['Update'];

export type Service = Tables['services']['Row'];
export type ServiceInsert = Tables['services']['Insert'];
export type ServiceUpdate = Tables['services']['Update'];

export type StaffService = Tables['staff_services']['Row'];
export type StaffSchedule = Tables['staff_schedules']['Row'];
export type StaffTimeOff = Tables['staff_time_off']['Row'];

export type Appointment = Tables['appointments']['Row'];
export type AppointmentInsert = Tables['appointments']['Insert'];
export type AppointmentUpdate = Tables['appointments']['Update'];

export type InventoryBrand = Tables['inventory_brands']['Row'];
export type InventoryProduct = Tables['inventory_items']['Row'];
export type InventoryProductInsert = Tables['inventory_items']['Insert'];
export type InventoryTransaction = Tables['inventory_transactions']['Row'];
export type ServiceMaterial = Tables['service_materials']['Row'];

export type WorkPhoto = Tables['work_photos']['Row'];
export type Expense = Tables['expenses']['Row'];
export type ExpenseInsert = Tables['expenses']['Insert'];
export type Payroll = Tables['payroll']['Row'];

export type ServicePackage = Tables['service_packages']['Row'];
export type ServicePackageItem = Tables['service_package_items']['Row'];

export type MessageTemplate = Tables['message_templates']['Row'];
export type NotificationLog = Tables['notification_log']['Row'];

export type SterilizationEquipment = Tables['sterilization_equipment']['Row'];
export type SterilizationInstrumentSet = Tables['sterilization_instrument_sets']['Row'];
export type SterilizationCycle = Tables['sterilization_cycles']['Row'];
export type SterilizationCycleInsert = Tables['sterilization_cycles']['Insert'];
export type SterilizationStorage = Tables['sterilization_storage']['Row'];
export type EquipmentMaintenance = Tables['equipment_maintenance']['Row'];

export type ActivityLog = Tables['activity_log']['Row'];

// ─── RFM Segment Type ────────────────────────────────────────────────────────

export type RfmSegment = Client['rfm_segment'];

// ─── Appointment Status Type ─────────────────────────────────────────────────

export type AppointmentStatus = Appointment['status'];
export type PaymentStatus = Appointment['payment_status'];
export type PaymentMethod = NonNullable<Appointment['payment_method']>;
