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
  isActive: boolean;
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

export interface OrderItem {
  /** Id de la ligne en base — absent pour une ligne ajoutée au panier, présent
   * pour une ligne chargée depuis une commande existante. À l'édition, une
   * ligne avec id garde ses valeurs figées côté serveur ; sans id elle prend
   * les valeurs actuelles du catalogue. */
  id?: string;
  product: Product;
  quantity: number;
  /** Prix figé au moment de la commande (côté panier : prix courant du produit) */
  unitPrice: number;
  /** Nom figé au moment de la commande (côté panier : nom courant du produit) */
  designation: string;
}

export interface Order {
  id: string;
  clientName: string;
  items: OrderItem[];
  pickupDate: string; // ISO Date string
  createdAt: string;
}
