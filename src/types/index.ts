import type { Database } from "./database";

export type Salon = Database["public"]["Tables"]["salons"]["Row"];
export type Staff = Database["public"]["Tables"]["staff"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type InventoryBrand = Database["public"]["Tables"]["inventory_brands"]["Row"];
export type InventoryProduct = Database["public"]["Tables"]["inventory_products"]["Row"];
export type InventoryTransaction = Database["public"]["Tables"]["inventory_transactions"]["Row"];

export type AppointmentStatus = "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
export type StaffRole = "owner" | "admin" | "staff";
export type TransactionType = "purchase" | "usage" | "adjustment" | "sale";

export interface AppointmentWithDetails extends Appointment {
  client: Client;
  staff: Staff;
  service: Service;
}

export interface ProductWithBrand extends InventoryProduct {
  brand: InventoryBrand;
}
