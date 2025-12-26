/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useRouter } from "next/navigation";
import { Product, Category } from "../types";

export default function AdminPage() {
  const {
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
  } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"menu" | "products" | "days">(
    "menu"
  );

  if (!user || user.role !== "admin") {
    // In a real app, we'd redirect here, but for now let's just show a message or redirect
    // router.push('/');
    // return null;
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
          />
        )}
        {activeTab === "products" && (
          <ProductsManager
            products={products}
            categories={categories}
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
      </main>
    </div>
  );
}

function CategoriesManager({
  categories,
  addCategory,
  updateCategory,
  deleteCategory,
}: any) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory({
        id: Date.now().toString(),
        name: newCategoryName,
        subCategories: [],
      });
      setNewCategoryName("");
    }
  };

  const handleAddSubCategory = (categoryId: string) => {
    const category = categories.find((c: Category) => c.id === categoryId);
    if (category && newSubCategoryName.trim()) {
      updateCategory({
        ...category,
        subCategories: [...(category.subCategories || []), newSubCategoryName],
      });
      setNewSubCategoryName("");
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
        {categories.map((category: Category) => (
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
                {category.subCategories?.map((sub, idx) => (
                  <li key={idx}>{sub}</li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ajouter sous-catégorie"
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm text-black"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        updateCategory({
                          ...category,
                          subCategories: [
                            ...(category.subCategories || []),
                            target.value,
                          ],
                        });
                        target.value = "";
                      }
                    }
                  }}
                />
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
  addProduct,
  updateProduct,
  deleteProduct,
}: any) {
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});

  const handleAddProduct = () => {
    if (newProduct.designation && newProduct.price && newProduct.categoryId) {
      addProduct({
        id: Date.now().toString(),
        designation: newProduct.designation,
        price: Number(newProduct.price),
        categoryId: newProduct.categoryId,
        subCategoryId: newProduct.subCategoryId,
      } as Product);
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
          {categories
            .find((c: Category) => c.id === newProduct.categoryId)
            ?.subCategories?.map((sub: string) => (
              <option key={sub} value={sub}>
                {sub}
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
                    {product.subCategoryId || "-"}
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
            key={day.date}
            className="border border-gray-200 rounded-md p-4 flex justify-between items-center bg-gray-50"
          >
            <span className="font-medium text-gray-800">
              {new Date(day.date).toLocaleDateString()}
            </span>
            <button
              onClick={() => removeAvailableDay(day.date)}
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
