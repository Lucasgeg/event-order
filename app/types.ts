export type Role = "admin" | "user";

export interface User {
  email: string;
  role: Role;
  name: string;
}

export interface Product {
  id: string;
  designation: string;
  price: number;
  categoryId: string;
  subCategoryId?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  subCategories?: SubCategory[];
}

export interface AvailableDay {
  id: string;
  date: string; // ISO Date string
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  clientName: string;
  items: OrderItem[];
  pickupDate: string; // ISO Date string
  createdAt: string;
}
