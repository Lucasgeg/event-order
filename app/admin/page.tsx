/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useRouter } from "next/navigation";
import { Product, Category, Order } from "../types";

export default function AdminPage() {
  const {
    user,
    isLoading,
    logout,
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
    availableDays,
    addAvailableDay,
    removeAvailableDay,
  } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "menu" | "products" | "days" | "orders" | "production"
  >("menu");

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/");
      } else if (user.role !== "admin") {
        router.push("/user");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">
                Admin Dashboard
              </h1>
              <div className="ml-10 flex items-baseline space-x-4">
                <button
                  onClick={() => setActiveTab("menu")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === "menu"
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Catégories
                </button>
                <button
                  onClick={() => setActiveTab("products")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === "products"
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Produits
                </button>
                <button
                  onClick={() => setActiveTab("days")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === "days"
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Jours Disponibles
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === "orders"
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Commandes
                </button>
                <button
                  onClick={() => setActiveTab("production")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === "production"
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Production
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-600">Bonjour, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === "menu" && (
          <CategoriesManager
            categories={categories}
            addCategory={addCategory}
            updateCategory={updateCategory}
            deleteCategory={deleteCategory}
            subCategories={subCategories}
            addSubCategory={addSubCategory}
            deleteSubCategory={deleteSubCategory}
          />
        )}
        {activeTab === "products" && (
          <ProductsManager
            products={products}
            categories={categories}
            subCategories={subCategories}
            addProduct={addProduct}
            updateProduct={updateProduct}
            deleteProduct={deleteProduct}
          />
        )}
        {activeTab === "days" && (
          <DaysManager
            availableDays={availableDays}
            addAvailableDay={addAvailableDay}
            removeAvailableDay={removeAvailableDay}
          />
        )}
        {activeTab === "orders" && (
          <OrdersManager availableDays={availableDays} />
        )}
        {activeTab === "production" && (
          <ProductionManager
            availableDays={availableDays}
            categories={categories}
            subCategories={subCategories}
          />
        )}
      </main>
    </div>
  );
}

function CategoriesManager({
  categories,
  addCategory,
  updateCategory,
  deleteCategory,
  subCategories,
  addSubCategory,
  deleteSubCategory,
}: any) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<
    string | null
  >(null);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory({
        name: newCategoryName,
      });
      setNewCategoryName("");
    }
  };

  const handleAddSubCategory = (categoryId: string) => {
    if (newSubCategoryName.trim()) {
      addSubCategory({
        name: newSubCategoryName,
        categoryId: categoryId,
      });
      setNewSubCategoryName("");
      setSelectedCategoryForSub(null);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4 text-gray-900">
        Gestion des Catégories
      </h2>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nouvelle catégorie"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-black"
        />
        <button
          onClick={handleAddCategory}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Ajouter
        </button>
      </div>

      <div className="space-y-4">
        {categories &&
          categories.map((category: Category) => (
            <div
              key={category.id}
              className="border border-gray-200 rounded-md p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-800">{category.name}</h3>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Supprimer
                </button>
              </div>

              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Sous-catégories:
                </h4>
                <ul className="list-disc list-inside mb-2 text-gray-700">
                  {subCategories
                    .filter((sub: any) => sub.categoryId === category.id)
                    .map((sub: any) => (
                      <li
                        key={sub.id}
                        className="flex justify-between items-center w-64"
                      >
                        <span>{sub.name}</span>
                        <button
                          onClick={() => deleteSubCategory(sub.id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                </ul>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ajouter sous-catégorie"
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm text-black"
                    value={
                      selectedCategoryForSub === category.id
                        ? newSubCategoryName
                        : ""
                    }
                    onChange={(e) => {
                      setSelectedCategoryForSub(category.id);
                      setNewSubCategoryName(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddSubCategory(category.id);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleAddSubCategory(category.id)}
                    className="text-sm bg-gray-200 px-2 rounded hover:bg-gray-300 text-black"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function ProductsManager({
  products,
  categories,
  subCategories,
  addProduct,
  updateProduct,
  deleteProduct,
}: any) {
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});

  const handleAddProduct = () => {
    if (newProduct.designation && newProduct.price && newProduct.categoryId) {
      addProduct({
        designation: newProduct.designation,
        price: Number(newProduct.price),
        categoryId: newProduct.categoryId,
        subCategoryId: newProduct.subCategoryId,
      });
      setNewProduct({});
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4 text-gray-900">
        Gestion des Produits
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 bg-gray-50 p-4 rounded-md">
        <input
          type="text"
          placeholder="Désignation"
          value={newProduct.designation || ""}
          onChange={(e) =>
            setNewProduct({ ...newProduct, designation: e.target.value })
          }
          className="border border-gray-300 rounded-md px-3 py-2 text-black"
        />
        <input
          type="number"
          placeholder="Prix"
          value={newProduct.price || ""}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: Number(e.target.value) })
          }
          className="border border-gray-300 rounded-md px-3 py-2 text-black"
        />
        <select
          value={newProduct.categoryId || ""}
          onChange={(e) =>
            setNewProduct({
              ...newProduct,
              categoryId: e.target.value,
              subCategoryId: undefined,
            })
          }
          className="border border-gray-300 rounded-md px-3 py-2 text-black"
        >
          <option value="">Catégorie</option>
          {categories.map((c: Category) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={newProduct.subCategoryId || ""}
          onChange={(e) =>
            setNewProduct({ ...newProduct, subCategoryId: e.target.value })
          }
          className="border border-gray-300 rounded-md px-3 py-2 text-black"
          disabled={!newProduct.categoryId}
        >
          <option value="">Sous-catégorie</option>
          {subCategories
            .filter((sub: any) => sub.categoryId === newProduct.categoryId)
            .map((sub: any) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
        </select>
        <button
          onClick={handleAddProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Ajouter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Désignation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sous-catégorie
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product: Product) => {
              const category = categories.find(
                (c: Category) => c.id === product.categoryId
              );
              const subCategory = subCategories.find(
                (s: any) => s.id === product.subCategoryId
              );
              return (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.designation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.price} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category?.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subCategory?.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DaysManager({
  availableDays,
  addAvailableDay,
  removeAvailableDay,
}: any) {
  const [newDate, setNewDate] = useState("");

  const handleAddDate = () => {
    if (newDate) {
      addAvailableDay(newDate);
      setNewDate("");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4 text-gray-900">
        Gestion des Jours Disponibles
      </h2>

      <div className="flex gap-2 mb-6 max-w-md">
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-black"
        />
        <button
          onClick={handleAddDate}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          Ajouter
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {availableDays.map((day: any) => (
          <div
            key={day.id}
            className="border border-gray-200 rounded-md p-4 flex justify-between items-center bg-gray-50"
          >
            <span className="font-medium text-gray-800">
              {new Date(day.date).toLocaleDateString()}
            </span>
            <button
              onClick={() => removeAvailableDay(day.id)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersManager({ availableDays }: { availableDays: any[] }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    // Filter by date
    if (selectedDate && !order.pickupDate.startsWith(selectedDate)) {
      return false;
    }
    // Filter by name
    if (
      searchQuery &&
      !order.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const sortedOrders = filteredOrders.sort((a, b) => {
    return sortOrder === "asc"
      ? a.clientName.localeCompare(b.clientName)
      : b.clientName.localeCompare(a.clientName);
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des commandes...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-lg font-medium text-gray-900">
          Gestion des Commandes
        </h2>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Date Filter */}
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-black text-sm"
          >
            <option value="">Toutes les dates</option>
            {availableDays.map((day) => (
              <option key={day.date} value={day.date}>
                {new Date(day.date).toLocaleDateString()}
              </option>
            ))}
          </select>

          {/* Name Search */}
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-black text-sm"
          />

          {/* Sort Button */}
          <button
            onClick={toggleSortOrder}
            className="px-3 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
          >
            Nom {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de retrait
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Aucune commande trouvée.
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.pickupDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <ul className="list-disc list-inside">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.quantity}x {item.product.designation}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.items
                      .reduce(
                        (acc, item) => acc + item.product.price * item.quantity,
                        0
                      )
                      .toFixed(2)}{" "}
                    €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/user?orderId=${order.id}`)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductionManager({
  availableDays,
  categories,
  subCategories,
}: {
  availableDays: any[];
  categories: Category[];
  subCategories: any[];
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/orders");
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (!selectedDate) return false;
    // Compare dates (ignoring time if necessary, but pickupDate is usually ISO string)
    // Assuming pickupDate in order is ISO string YYYY-MM-DD...
    return order.pickupDate.startsWith(selectedDate);
  });

  // Aggregate products
  const productQuantities = new Map<
    string,
    {
      name: string;
      quantity: number;
      categoryName: string;
      subCategoryName: string;
    }
  >();

  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      const productId = item.product.id;
      const current = productQuantities.get(productId);
      if (current) {
        current.quantity += item.quantity;
      } else {
        const category = categories.find(
          (c) => c.id === item.product.categoryId
        );
        const subCategory = subCategories.find(
          (s) => s.id === item.product.subCategoryId
        );

        productQuantities.set(productId, {
          name: item.product.designation,
          quantity: item.quantity,
          categoryName: category?.name || "",
          subCategoryName: subCategory?.name || "",
        });
      }
    });
  });

  const aggregatedProducts = Array.from(productQuantities.values()).sort(
    (a, b) => a.name.localeCompare(b.name)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-production,
          #printable-production * {
            visibility: visible;
          }
          #printable-production {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 20px;
          }
        }
      `}</style>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Production par Jour
        </h2>
        {selectedDate && (
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
              />
            </svg>
            Imprimer
          </button>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sélectionner une date
        </label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full md:w-64 border border-gray-300 rounded-md px-3 py-2 text-black"
        >
          <option value="">-- Choisir une date --</option>
          {availableDays.map((day) => (
            <option key={day.date} value={day.date}>
              {new Date(day.date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {selectedDate && (
        <div id="printable-production">
          <h3 className="text-md font-bold text-gray-800 mb-4">
            Total à produire pour le{" "}
            {new Date(selectedDate).toLocaleDateString()}
          </h3>

          {loading ? (
            <div>Chargement...</div>
          ) : aggregatedProducts.length === 0 ? (
            <div className="text-gray-500">Aucune commande pour ce jour.</div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sous-catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité Totale
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {aggregatedProducts.map((item) => (
                    <tr key={item.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.categoryName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.subCategoryName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                        {item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
