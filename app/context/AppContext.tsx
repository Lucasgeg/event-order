/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useUser, useOrganization } from "@clerk/nextjs";
import { User, Product, Category, SubCategory, Order } from "../types";

interface AppContextType {
  user: User | null;
  isLoading: boolean;

  products: Product[];
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  categories: Category[];
  addCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  subCategories: SubCategory[];
  addSubCategory: (subCategory: Omit<SubCategory, "id">) => Promise<void>;
  deleteSubCategory: (id: string) => Promise<void>;

  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdAt">) => Promise<void>;
  updateOrder: (
    id: string,
    order: Partial<Omit<Order, "id" | "createdAt">>
  ) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { membership } = useOrganization();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const user: User | null = clerkUser
    ? {
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        name: clerkUser.fullName || clerkUser.username || "User",
        role: membership?.role === "org:admin" ? "admin" : "user",
      }
    : null;

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch("/api/catalog");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setCategories(data.categories);
        setSubCategories(data.subCategories);
      }
    } catch (error) {
      console.error("Failed to fetch catalog", error);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const refresh = async () => {
        await refreshData();
      };
      refresh();
    }
  }, [isLoaded, isSignedIn, refreshData]);

  // Product Actions
  const addProduct = async (product: Omit<Product, "id">) => {
    await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "product", ...product }),
    });
    await refreshData();
  };

  const updateProduct = async (product: Product) => {
    await fetch("/api/catalog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "product", ...product }),
    });
    await refreshData();
  };

  const deleteProduct = async (id: string) => {
    await fetch(`/api/catalog?type=product&id=${id}`, {
      method: "DELETE",
    });
    await refreshData();
  };

  // Category Actions
  const addCategory = async (category: Omit<Category, "id">) => {
    await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "category", ...category }),
    });
    await refreshData();
  };

  const updateCategory = async (category: Category) => {
    await fetch("/api/catalog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "category", ...category }),
    });
    await refreshData();
  };

  const deleteCategory = async (id: string) => {
    await fetch(`/api/catalog?type=category&id=${id}`, {
      method: "DELETE",
    });
    await refreshData();
  };

  // SubCategory Actions
  const addSubCategory = async (subCategory: Omit<SubCategory, "id">) => {
    await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "subCategory", ...subCategory }),
    });
    await refreshData();
  };

  const deleteSubCategory = async (id: string) => {
    await fetch(`/api/catalog?type=subCategory&id=${id}`, {
      method: "DELETE",
    });
    await refreshData();
  };

  // Order Actions
  const addOrder = async (order: Omit<Order, "id" | "createdAt">) => {
    try {
      const apiBody = {
        clientName: order.clientName,
        pickupDate: order.pickupDate,
        items: order.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiBody),
      });

      if (res.ok) {
        const newOrder = await res.json();
        setOrders([...orders, newOrder]);
        console.log("Order saved to DB:", newOrder);
      } else {
        console.error("Failed to save order");
      }
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const updateOrder = async (
    id: string,
    order: Partial<Omit<Order, "id" | "createdAt">>
  ) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: order.clientName,
          pickupDate: order.pickupDate,
          items: order.items?.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(orders.map((o) => (o.id === id ? updatedOrder : o)));
        console.log("Order updated in DB:", updatedOrder);
      } else {
        console.error("Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading: !isLoaded,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        subCategories,
        addSubCategory,
        deleteSubCategory,
        orders,
        addOrder,
        updateOrder,
        refreshData,
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
