/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useApp } from "../../context/AppContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Product, OrderItem } from "../../types";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import {
  ChevronLeft,
  Plus,
  Minus,
  Trash2,
  ShoppingBasket,
  Maximize2,
  Minimize2,
  LayoutDashboard,
} from "lucide-react";
import {
  Button,
  Input,
  Label,
  IconButton,
  EmptyState,
  cn,
} from "../../components/ui";

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
    if (p.isActive === false) return false;
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    if (selectedSubCategory && p.subCategoryId !== selectedSubCategory)
      return false;
    return true;
  });

  const currentCategory = categories.find((c) => c.id === selectedCategory);
  const currentSubCategory = subCategories.find(
    (s) => s.id === selectedSubCategory
  );

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-cream flex flex-col h-screen overflow-hidden">
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-cream relative">
          {/* Back Button & Title */}
          <div className="px-4 bg-surface border-b border-line flex items-center gap-3 shrink-0 h-16">
            {view !== "categories" && (
              <IconButton label="Retour" onClick={handleBack}>
                <ChevronLeft className="h-5 w-5" />
              </IconButton>
            )}
            <Image
              src="/logo.png"
              alt="Logo Cahier du Chef"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <h1 className="font-display text-lg sm:text-xl font-bold text-ink truncate">
              {view === "categories" && "Sélectionnez une catégorie"}
              {view === "subcategories" && currentCategory?.name}
              {view === "products" &&
                (currentSubCategory?.name || currentCategory?.name)}
            </h1>

            <div className="ml-auto flex items-center gap-3">
              {user?.role === "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/admin")}
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">Retour Admin</span>
                </Button>
              )}
              <span className="text-sm text-ink-soft hidden sm:inline">
                {user?.name}
              </span>
              <UserButton />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Categories View */}
            {view === "categories" && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {categories.map((cat) => {
                  const catSubCategories = subCategories.filter(
                    (s) => s.categoryId === cat.id
                  );
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className="bg-surface p-6 sm:p-8 rounded-xl border border-line hover:border-gold hover:shadow-md active:scale-[0.98] transition-all duration-200 text-center flex flex-col items-center justify-center gap-3 h-40 sm:h-48 cursor-pointer"
                    >
                      <span className="font-display text-xl sm:text-2xl font-bold text-ink">
                        {cat.name}
                      </span>
                      <span className="text-sm text-ink-soft">
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {subCategories
                  .filter((s) => s.categoryId === currentCategory.id)
                  .map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubCategorySelect(sub.id)}
                      className="bg-surface p-6 sm:p-8 rounded-xl border border-line hover:border-gold hover:shadow-md active:scale-[0.98] transition-all duration-200 text-center flex flex-col items-center justify-center h-32 sm:h-40 cursor-pointer"
                    >
                      <span className="font-display text-lg sm:text-xl font-bold text-ink">
                        {sub.name}
                      </span>
                    </button>
                  ))}
              </div>
            )}

            {/* Products View */}
            {view === "products" && (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => {
                  const subCategory = subCategories.find(
                    (s) => s.id === product.subCategoryId
                  );
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="group bg-surface p-4 rounded-xl border border-line hover:border-gold hover:shadow-md active:scale-[0.98] transition-all duration-200 text-left flex flex-col h-full cursor-pointer"
                    >
                      <div className="font-semibold text-ink mb-1">
                        {product.designation}
                      </div>
                      <div className="text-sm text-ink-soft mb-3">
                        {subCategory?.name || ""}
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-lg font-bold text-primary tabular-nums">
                          {product.price.toFixed(2)} €
                        </span>
                        <span
                          className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gold-soft text-gold-dark group-hover:bg-gold group-hover:text-white transition-colors"
                          aria-hidden
                        >
                          <Plus className="h-4 w-4" />
                        </span>
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
          className={cn(
            "bg-surface shadow-xl flex flex-col shrink-0 z-20 border-t md:border-t-0 md:border-l border-line transition-all duration-300",
            isOrderFullScreen
              ? "fixed inset-0 w-full h-full"
              : "w-full md:w-80 lg:w-96 h-[40vh] md:h-auto"
          )}
        >
          <div className="p-4 md:p-5 border-b border-line bg-cream/60">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h2 className="font-display text-lg font-bold text-ink flex items-center gap-2">
                <ShoppingBasket className="h-5 w-5 text-gold-dark" aria-hidden />
                {orderId ? "Modifier Commande" : "Nouvelle Commande"}
                {cartCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-primary text-white text-xs font-bold tabular-nums">
                    {cartCount}
                  </span>
                )}
              </h2>
              <IconButton
                label={isOrderFullScreen ? "Réduire" : "Agrandir"}
                onClick={() => setIsOrderFullScreen(!isOrderFullScreen)}
              >
                {isOrderFullScreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </IconButton>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label htmlFor="client-name">Client</Label>
                <Input
                  id="client-name"
                  type="text"
                  placeholder="Nom Prénom"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="pickup-date">Date de retrait</Label>
                <Input
                  id="pickup-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <EmptyState
                icon={<ShoppingBasket className="h-6 w-6" aria-hidden />}
                title="Panier vide"
                description="Touchez un produit pour l'ajouter à la commande."
              />
            ) : (
              <ul className="space-y-2.5">
                {cart.map((item) => (
                  <li
                    key={item.product.id}
                    className="flex justify-between items-center gap-3 bg-cream/70 border border-line p-3 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink truncate">
                        {item.product.designation}
                      </div>
                      <div className="text-sm text-ink-soft tabular-nums">
                        {item.product.price.toFixed(2)} €
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-line rounded-lg bg-surface overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          aria-label={`Réduire la quantité de ${item.product.designation}`}
                          className="flex items-center justify-center h-9 w-9 text-ink-soft hover:bg-parchment hover:text-ink transition-colors cursor-pointer"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-ink tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          aria-label={`Augmenter la quantité de ${item.product.designation}`}
                          className="flex items-center justify-center h-9 w-9 text-ink-soft hover:bg-parchment hover:text-ink transition-colors cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <IconButton
                        label={`Retirer ${item.product.designation}`}
                        tone="danger"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 md:p-5 border-t border-line bg-cream/60">
            <div className="flex justify-between items-center mb-4 font-bold text-ink">
              <span className="text-lg">Total</span>
              <span className="font-display text-2xl tabular-nums">
                {calculateTotal().toFixed(2)} €
              </span>
            </div>
            <Button
              onClick={handleSaveOrder}
              disabled={cart.length === 0}
              size="lg"
              className="w-full"
            >
              {orderId ? "Mettre à jour" : "Valider la commande"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function UserPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-cream text-ink-soft">
          Chargement...
        </div>
      }
    >
      <UserPageContent />
    </Suspense>
  );
}
