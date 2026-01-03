/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useApp } from "../context/AppContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Product, OrderItem } from "../types";
import { UserButton } from "@clerk/nextjs";

function UserPageContent() {
  const { user, products, categories, subCategories, addOrder, updateOrder } =
    useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [clientName, setClientName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [loadingOrder, setLoadingOrder] = useState(false);

  // Navigation state
  const [view, setView] = useState<"categories" | "subcategories" | "products">(
    "categories"
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null
  );
  const [isOrderFullScreen, setIsOrderFullScreen] = useState(false);

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        setLoadingOrder(true);
        try {
          const response = await fetch(`/api/orders/${orderId}`);
          if (response.ok) {
            const order = await response.json();
            setClientName(order.clientName);
            // Ensure date format matches input (YYYY-MM-DD)
            const date = new Date(order.pickupDate);
            const formattedDate = date.toISOString().split("T")[0];
            setSelectedDate(formattedDate);

            // Map items to cart format
            // Note: We need to make sure products are loaded or we have full product info in order items
            // The API returns items with product included.
            setCart(order.items);
          }
        } catch (error) {
          console.error("Error fetching order:", error);
        } finally {
          setLoadingOrder(false);
        }
      };
      fetchOrder();
    }
  }, [orderId]);

  if (!user) {
    // router.push('/');
    // return null;
  }

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      });
    });
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const handleSaveOrder = async () => {
    if (!clientName || !selectedDate || cart.length === 0) {
      alert(
        "Veuillez remplir le nom du client, la date et ajouter des produits."
      );
      return;
    }

    if (orderId) {
      await updateOrder(orderId, {
        clientName,
        items: cart,
        pickupDate: selectedDate,
      });
      alert("Commande modifiée !");
      router.push("/admin"); // Redirect back to admin after edit
    } else {
      await addOrder({
        clientName,
        items: cart,
        pickupDate: selectedDate,
      });
      alert("Commande enregistrée !");
      // Reset form
      setClientName("");
      setCart([]);
      setSelectedDate("");
      setView("categories");
      setSelectedCategory(null);
      setSelectedSubCategory(null);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const hasSubCategories = subCategories.some(
      (s) => s.categoryId === categoryId
    );
    if (hasSubCategories) {
      setView("subcategories");
    } else {
      setView("products");
    }
  };

  const handleSubCategorySelect = (subCategory: string) => {
    setSelectedSubCategory(subCategory);
    setView("products");
  };

  const handleBack = () => {
    if (view === "products") {
      const hasSubCategories = subCategories.some(
        (s) => s.categoryId === selectedCategory
      );
      if (hasSubCategories) {
        setView("subcategories");
        setSelectedSubCategory(null);
      } else {
        setView("categories");
        setSelectedCategory(null);
      }
    } else if (view === "subcategories") {
      setView("categories");
      setSelectedCategory(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    if (selectedSubCategory && p.subCategoryId !== selectedSubCategory)
      return false;
    return true;
  });

  const currentCategory = categories.find((c) => c.id === selectedCategory);
  const currentSubCategory = subCategories.find(
    (s) => s.id === selectedSubCategory
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col h-screen overflow-hidden">
      {/* No Navbar requested */}

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200 bg-gray-50 relative">
          {/* Back Button & Title */}
          <div className="p-4 bg-white shadow-sm flex items-center gap-4 shrink-0 h-16">
            {view !== "categories" && (
              <button
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              >
                ← Retour
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-800">
              {view === "categories" && "Sélectionnez une catégorie"}
              {view === "subcategories" && currentCategory?.name}
              {view === "products" &&
                (currentSubCategory?.name || currentCategory?.name)}
            </h2>

            {/* Logout button moved here since navbar is gone */}
            <div className="ml-auto flex items-center gap-4">
              {user?.role === "admin" && (
                <button
                  onClick={() => router.push("/admin")}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 border border-gray-300"
                >
                  Retour Admin
                </button>
              )}
              <span className="text-sm text-gray-500 hidden sm:inline">
                {user?.role === "user" ? "Utilisateur" : "Admin"}
              </span>
              <UserButton />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Categories View */}
            {view === "categories" && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => {
                  const catSubCategories = subCategories.filter(
                    (s) => s.categoryId === cat.id
                  );
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all text-center border border-gray-200 flex flex-col items-center justify-center gap-4 h-48"
                    >
                      <span className="text-2xl font-bold text-gray-800">
                        {cat.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {catSubCategories.length
                          ? `${catSubCategories.length} sous-catégories`
                          : "Produits directs"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Subcategories View */}
            {view === "subcategories" && currentCategory && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {subCategories
                  .filter((s) => s.categoryId === currentCategory.id)
                  .map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubCategorySelect(sub.id)}
                      className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all text-center border border-gray-200 flex flex-col items-center justify-center h-40"
                    >
                      <span className="text-xl font-bold text-gray-800">
                        {sub.name}
                      </span>
                    </button>
                  ))}
              </div>
            )}

            {/* Products View */}
            {view === "products" && (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const subCategory = subCategories.find(
                    (s) => s.id === product.subCategoryId
                  );
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left border border-gray-200 flex flex-col h-full"
                    >
                      <div className="font-bold text-gray-800 mb-1">
                        {product.designation}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {subCategory?.name || ""}
                      </div>
                      <div className="mt-auto text-lg font-semibold text-blue-600">
                        {product.price.toFixed(2)} €
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div
          className={`bg-white shadow-xl flex flex-col shrink-0 z-20 border-t md:border-t-0 md:border-l border-gray-200 transition-all duration-300 ${
            isOrderFullScreen
              ? "fixed inset-0 w-full h-full"
              : "w-full md:w-80 lg:w-96 h-[40vh] md:h-auto"
          }`}
        >
          <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                {orderId ? "Modifier Commande" : "Nouvelle Commande"}
              </h2>
              <button
                onClick={() => setIsOrderFullScreen(!isOrderFullScreen)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50"
              >
                {isOrderFullScreen ? "Réduire" : "Agrandir"}
              </button>
            </div>

            <div className="space-y-2 md:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                <input
                  type="text"
                  placeholder="Nom Prénom"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de retrait
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                />
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">Panier vide</div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-md"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {item.product.designation}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.product.price.toFixed(2)} €
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-300 rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-2 font-medium text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-4 text-xl font-bold text-gray-900">
              <span>Total</span>
              <span>{calculateTotal().toFixed(2)} €</span>
            </div>
            <button
              onClick={handleSaveOrder}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                cart.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 shadow-md"
              }`}
            >
              {orderId ? "Mettre à jour" : "Valider la commande"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function UserPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <UserPageContent />
    </Suspense>
  );
}
