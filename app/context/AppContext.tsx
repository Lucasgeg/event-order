/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession, signOut } from "next-auth/react";
import { User, Product, Category, Order, AvailableDay } from "../types";

interface AppContextType {
  user: User | null;
  logout: () => void;

  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;

  availableDays: AvailableDay[];
  addAvailableDay: (date: string) => void;
  removeAvailableDay: (date: string) => void;

  orders: Order[];
  addOrder: (order: Order) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_CATEGORIES: Category[] = [
  { id: "1", name: "Boissons", subCategories: ["Softs", "Alcools"] },
  { id: "2", name: "Plats", subCategories: ["Entrées", "Plats chauds"] },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    designation: "Coca Cola",
    price: 2.5,
    categoryId: "1",
    subCategoryId: "Softs",
  },
  {
    id: "2",
    designation: "Bière Pression",
    price: 5,
    categoryId: "1",
    subCategoryId: "Alcools",
  },
  {
    id: "3",
    designation: "Salade César",
    price: 12,
    categoryId: "2",
    subCategoryId: "Entrées",
  },
];

const INITIAL_DAYS: AvailableDay[] = [
  {
    date: new Date(new Date().setDate(new Date().getDate() + 1))
      .toISOString()
      .split("T")[0],
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() + 2))
      .toISOString()
      .split("T")[0],
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [availableDays, setAvailableDays] =
    useState<AvailableDay[]>(INITIAL_DAYS);
  const [orders, setOrders] = useState<Order[]>([]);

  const user: User | null = session?.user
    ? {
        email: session.user.email!,
        name: session.user.name!,
        role: (session.user as any).role as "admin" | "user",
      }
    : null;

  const logout = () => {
    signOut({ callbackUrl: "/" });
  };

  // Product Actions
  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (product: Product) => {
    setProducts(products.map((p) => (p.id === product.id ? product : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  // Category Actions
  const addCategory = (category: Category) => {
    setCategories([...categories, category]);
  };

  const updateCategory = (category: Category) => {
    setCategories(categories.map((c) => (c.id === category.id ? category : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  // Available Days Actions
  const addAvailableDay = (date: string) => {
    if (!availableDays.find((d) => d.date === date)) {
      setAvailableDays([...availableDays, { date }]);
    }
  };

  const removeAvailableDay = (date: string) => {
    setAvailableDays(availableDays.filter((d) => d.date !== date));
  };

  // Order Actions
  const addOrder = (order: Order) => {
    setOrders([...orders, order]);
    console.log("Order saved to DB (mock):", order);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        logout,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        availableDays,
        addAvailableDay,
        removeAvailableDay,
        orders,
        addOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
