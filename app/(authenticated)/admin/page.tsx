/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useRouter } from "next/navigation";
import { Product, Category, Order } from "../../types";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import {
  LayoutGrid,
  UtensilsCrossed,
  ClipboardList,
  ChefHat,
  Users,
  NotebookPen,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  Printer,
  Sparkles,
  Plus,
  PackageOpen,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  IconButton,
  Input,
  Select,
  Label,
  Badge,
  EmptyState,
  Segmented,
  Th,
  Td,
  LoadingBlock,
  cn,
} from "../../components/ui";
import { OrdersManager } from "../../components/OrdersManager";

type AdminTab = "menu" | "products" | "orders" | "production" | "members";

const NAV_ITEMS: {
  key: AdminTab;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: "menu",
    label: "Catégories",
    description: "Organisez votre carte en catégories et sous-catégories.",
    icon: LayoutGrid,
  },
  {
    key: "products",
    label: "Produits",
    description: "Gérez les produits de votre catalogue et leurs prix.",
    icon: UtensilsCrossed,
  },
  {
    key: "orders",
    label: "Commandes",
    description: "Suivez les commandes à venir et passées de vos clients.",
    icon: ClipboardList,
  },
  {
    key: "production",
    label: "Production",
    description: "Consolidez les quantités à produire par jour ou période.",
    icon: ChefHat,
  },
  {
    key: "members",
    label: "Membres",
    description: "Invitez votre équipe et gérez les rôles.",
    icon: Users,
  },
];

export default function AdminPage() {
  const {
    user,
    isLoading,
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
    refreshData,
  } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("menu");

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
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <LoadingBlock />
      </div>
    );
  }

  const activeItem = NAV_ITEMS.find((item) => item.key === activeTab)!;

  return (
    <div className="min-h-screen bg-cream">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-surface border-r border-line z-40">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-line">
          <Image
            src="/logo.png"
            alt="Logo Cahier du Chef"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="font-display text-lg font-bold text-ink">
            Cahier du Chef
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navigation principale">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 w-full h-11 px-3 rounded-lg text-sm font-semibold transition-colors duration-200 cursor-pointer",
                  isActive
                    ? "bg-gold-soft text-primary"
                    : "text-ink-soft hover:bg-parchment hover:text-ink"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-gold-dark" : "text-ink-soft"
                  )}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-line space-y-3">
          <button
            onClick={() => router.push("/user")}
            className="flex items-center gap-3 w-full h-11 px-3 rounded-lg text-sm font-semibold text-ink-soft hover:bg-parchment hover:text-ink transition-colors duration-200 cursor-pointer"
          >
            <NotebookPen className="h-5 w-5" />
            Prise de commande
          </button>
          <div className="flex items-center gap-3 px-3">
            <UserButton />
            <span className="text-sm text-ink-soft truncate">{user?.name}</span>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-surface border-b border-line">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo Cahier du Chef"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="font-display text-base font-bold text-ink">
              Cahier du Chef
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/user")}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-semibold text-ink-soft hover:bg-parchment transition-colors cursor-pointer"
            >
              <NotebookPen className="h-4 w-4" />
              Commande
            </button>
            <UserButton />
          </div>
        </div>
        <nav
          className="flex gap-1 px-3 pb-2 overflow-x-auto"
          aria-label="Navigation principale"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer",
                  isActive
                    ? "bg-gold-soft text-primary"
                    : "text-ink-soft hover:bg-parchment"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-ink">
              {activeItem.label}
            </h1>
            <p className="mt-1 text-ink-soft">{activeItem.description}</p>
          </div>

          {activeTab === "menu" && (
            <CategoriesManager
              categories={categories}
              addCategory={addCategory}
              updateCategory={updateCategory}
              deleteCategory={deleteCategory}
              subCategories={subCategories}
              addSubCategory={addSubCategory}
              deleteSubCategory={deleteSubCategory}
              refreshData={refreshData}
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
          {activeTab === "orders" && <OrdersManager />}
          {activeTab === "production" && (
            <ProductionManager
              categories={categories}
              subCategories={subCategories}
            />
          )}
          {activeTab === "members" && <MembersManager />}
        </main>
      </div>
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
  refreshData,
}: any) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<
    string | null
  >(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [showAutoGeneration, setShowAutoGeneration] = useState(
    categories.length === 0
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsGenerating(true);
    try {
      await fetch("/api/generate-menu", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Erreur lors de la génération:", error);
    } finally {
      setIsGenerating(false);
      refreshData();
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory({
        name: newCategoryName,
      });
      setNewCategoryName("");
    }
  };

  const startEditingCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const cancelEditingCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const saveCategoryEdit = (categoryId: string) => {
    if (editingCategoryName.trim()) {
      updateCategory({ id: categoryId, name: editingCategoryName });
      setEditingCategoryId(null);
      setEditingCategoryName("");
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
    <div className="space-y-6">
      <Card className="p-6">
        <CardHeader
          title="Génération automatique"
          description="Importez votre carte en PDF, l'IA en extrait catégories et produits."
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAutoGeneration(!showAutoGeneration)}
            >
              {showAutoGeneration ? "Masquer" : "Afficher"}
            </Button>
          }
        />

        {showAutoGeneration && (
          <>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                disabled={isGenerating}
                className="block w-full text-sm text-ink-soft cursor-pointer
              file:mr-4 file:h-11 file:px-4 file:py-2.5
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold file:cursor-pointer
              file:bg-gold-soft file:text-primary
              hover:file:bg-gold/25 file:transition-colors"
              />
              <Button
                onClick={handleGenerate}
                disabled={!selectedFile}
                loading={isGenerating}
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                {isGenerating ? "Traitement..." : "Générer"}
              </Button>
            </div>
            <div className="mt-4 p-4 bg-gold-soft/60 border-l-4 border-gold rounded-r-lg text-ink">
              <p className="text-sm">
                <span className="font-bold">Note importante :</span> La
                génération du menu est réalisée par une intelligence
                artificielle. Il est impératif de vérifier l&apos;exactitude des
                catégories et produits générés, car l&apos;IA peut commettre des
                erreurs.
              </p>
            </div>
          </>
        )}
      </Card>

      <Card className="p-6">
        <CardHeader
          title="Gestion des catégories"
          description="Ajoutez, renommez ou supprimez les catégories de votre carte."
        />

        <div className="flex gap-2 mb-6">
          <Input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCategory();
            }}
            placeholder="Nouvelle catégorie"
            className="flex-1"
          />
          <Button onClick={handleAddCategory}>
            <Plus className="h-4 w-4" aria-hidden />
            Ajouter
          </Button>
        </div>

        {categories.length === 0 ? (
          <EmptyState
            icon={<LayoutGrid className="h-6 w-6" aria-hidden />}
            title="Aucune catégorie"
            description="Créez votre première catégorie ou générez votre carte automatiquement à partir d'un PDF."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {categories.map((category: Category) => (
              <div
                key={category.id}
                className="border border-line rounded-xl p-4 bg-cream/50"
              >
                <div className="flex justify-between items-center mb-3 gap-2">
                  {editingCategoryId === category.id ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <Input
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveCategoryEdit(category.id);
                          if (e.key === "Escape") cancelEditingCategory();
                        }}
                        className="h-9 text-sm"
                        autoFocus
                      />
                      <IconButton
                        label="Enregistrer"
                        tone="primary"
                        onClick={() => saveCategoryEdit(category.id)}
                      >
                        <Check className="h-4 w-4" />
                      </IconButton>
                      <IconButton label="Annuler" onClick={cancelEditingCategory}>
                        <X className="h-4 w-4" />
                      </IconButton>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-display font-bold text-ink truncate">
                        {category.name}
                      </h3>
                      <div className="flex gap-1 shrink-0">
                        <IconButton
                          label={`Modifier ${category.name}`}
                          tone="primary"
                          onClick={() => startEditingCategory(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          label={`Supprimer ${category.name}`}
                          tone="danger"
                          onClick={() => deleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-ink-soft uppercase tracking-wider mb-2">
                    Sous-catégories
                  </h4>
                  <ul className="space-y-1 mb-3">
                    {subCategories
                      .filter((sub: any) => sub.categoryId === category.id)
                      .map((sub: any) => (
                        <li
                          key={sub.id}
                          className="flex justify-between items-center gap-2 rounded-lg bg-surface border border-line px-3 py-1.5"
                        >
                          <span className="text-sm text-ink truncate">
                            {sub.name}
                          </span>
                          <IconButton
                            label={`Supprimer ${sub.name}`}
                            tone="danger"
                            className="h-7 w-7"
                            onClick={() => deleteSubCategory(sub.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </IconButton>
                        </li>
                      ))}
                  </ul>
                  <div className="flex gap-1.5">
                    <Input
                      type="text"
                      placeholder="Ajouter sous-catégorie"
                      className="h-9 text-sm"
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
                    <IconButton
                      label="Ajouter la sous-catégorie"
                      tone="primary"
                      onClick={() => handleAddSubCategory(category.id)}
                      className="border border-line bg-surface"
                    >
                      <Plus className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
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
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Product>>({});
  const [searchQuery, setSearchQuery] = useState("");

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

  const startEditing = (product: Product) => {
    setEditingProductId(product.id);
    setEditFormData({
      designation: product.designation,
      price: product.price,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId,
      isActive: product.isActive,
    });
  };

  const cancelEditing = () => {
    setEditingProductId(null);
    setEditFormData({});
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { action } = await deleteProduct(productId);
      if (action === "deactivated") {
        alert(
          "Ce produit a déjà été commandé, il ne peut pas être supprimé : il a été désactivé et n'apparaîtra plus dans le catalogue."
        );
      }
    } catch {
      alert("Erreur lors de la suppression du produit. Réessayez ou contactez le support.");
    }
  };

  const saveEdit = (productId: string) => {
    if (!editFormData.categoryId || !editFormData.designation) {
      return;
    }
    const data: Product = {
      id: productId,
      categoryId: editFormData.categoryId,
      designation: editFormData.designation,
      price: Number(editFormData.price),
      subCategoryId: editFormData.subCategoryId,
      isActive: editFormData.isActive ?? true,
    };
    updateProduct(data);
    setEditingProductId(null);
    setEditFormData({});
  };

  const filteredProducts = products.filter((product: Product) =>
    product.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="p-6">
      <CardHeader
        title="Gestion des produits"
        description="Ajoutez vos produits, ajustez les prix et activez ou désactivez-les."
      />

      <div className="mb-6 relative w-full md:w-80">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft pointer-events-none"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Rechercher par nom..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          aria-label="Rechercher un produit"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 bg-cream/70 border border-line p-4 rounded-xl">
        <Input
          type="text"
          placeholder="Désignation"
          value={newProduct.designation || ""}
          onChange={(e) =>
            setNewProduct({ ...newProduct, designation: e.target.value })
          }
        />
        <Input
          type="number"
          placeholder="Prix (€)"
          value={newProduct.price || ""}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: Number(e.target.value) })
          }
        />
        <Select
          value={newProduct.categoryId || ""}
          onChange={(e) =>
            setNewProduct({
              ...newProduct,
              categoryId: e.target.value,
              subCategoryId: undefined,
            })
          }
        >
          <option value="">Catégorie</option>
          {categories.map((c: Category) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          value={newProduct.subCategoryId || ""}
          onChange={(e) =>
            setNewProduct({ ...newProduct, subCategoryId: e.target.value })
          }
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
        </Select>
        <Button onClick={handleAddProduct}>
          <Plus className="h-4 w-4" aria-hidden />
          Ajouter
        </Button>
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<PackageOpen className="h-6 w-6" aria-hidden />}
          title={searchQuery ? "Aucun résultat" : "Aucun produit"}
          description={
            searchQuery
              ? "Aucun produit ne correspond à votre recherche."
              : "Ajoutez votre premier produit à l'aide du formulaire ci-dessus."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-parchment/60">
              <tr>
                <Th>Désignation</Th>
                <Th>Prix</Th>
                <Th>Actif</Th>
                <Th>Catégorie</Th>
                <Th>Sous-catégorie</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-line">
              {filteredProducts.map((product: Product) => {
                const isEditing = editingProductId === product.id;
                const category = categories.find(
                  (c: Category) => c.id === product.categoryId
                );
                const subCategory = subCategories.find(
                  (s: any) => s.id === product.subCategoryId
                );

                if (isEditing) {
                  return (
                    <tr key={product.id} className="bg-gold-soft/30">
                      <Td>
                        <Input
                          type="text"
                          value={editFormData.designation || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              designation: e.target.value,
                            })
                          }
                          className="h-9 text-sm min-w-40"
                        />
                      </Td>
                      <Td>
                        <Input
                          type="number"
                          value={editFormData.price || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              price: Number(e.target.value),
                            })
                          }
                          className="h-9 text-sm w-24"
                        />
                      </Td>
                      <Td>
                        <input
                          type="checkbox"
                          checked={editFormData.isActive ?? true}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              isActive: e.target.checked,
                            })
                          }
                          className="h-4 w-4 accent-olive cursor-pointer"
                          aria-label="Produit actif"
                        />
                      </Td>
                      <Td>
                        <Select
                          value={editFormData.categoryId || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              categoryId: e.target.value,
                              subCategoryId: undefined,
                            })
                          }
                          className="h-9 text-sm min-w-32"
                        >
                          {categories.map((c: Category) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </Select>
                      </Td>
                      <Td>
                        <Select
                          value={editFormData.subCategoryId || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              subCategoryId: e.target.value,
                            })
                          }
                          className="h-9 text-sm min-w-32"
                        >
                          <option value="">Aucune</option>
                          {subCategories
                            .filter(
                              (sub: any) =>
                                sub.categoryId === editFormData.categoryId
                            )
                            .map((sub: any) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name}
                              </option>
                            ))}
                        </Select>
                      </Td>
                      <Td className="text-right whitespace-nowrap">
                        <div className="inline-flex gap-1">
                          <IconButton
                            label="Enregistrer"
                            tone="primary"
                            onClick={() => saveEdit(product.id)}
                          >
                            <Check className="h-4 w-4" />
                          </IconButton>
                          <IconButton label="Annuler" onClick={cancelEditing}>
                            <X className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </Td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-cream/60 transition-colors"
                  >
                    <Td className="font-semibold whitespace-nowrap">
                      {product.designation}
                    </Td>
                    <Td className="whitespace-nowrap tabular-nums">
                      {product.price.toFixed(2)} €
                    </Td>
                    <Td>
                      <button
                        onClick={() =>
                          updateProduct({
                            ...product,
                            isActive: !product.isActive,
                          })
                        }
                        role="switch"
                        aria-checked={product.isActive !== false}
                        aria-label={`${product.designation} ${
                          product.isActive !== false ? "actif" : "inactif"
                        }`}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                          product.isActive !== false ? "bg-olive" : "bg-line"
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                            product.isActive !== false
                              ? "translate-x-5"
                              : "translate-x-0"
                          )}
                        />
                      </button>
                    </Td>
                    <Td className="text-ink-soft whitespace-nowrap">
                      {category?.name || "-"}
                    </Td>
                    <Td className="text-ink-soft whitespace-nowrap">
                      {subCategory?.name || "-"}
                    </Td>
                    <Td className="text-right whitespace-nowrap">
                      <div className="inline-flex gap-1">
                        <IconButton
                          label={`Modifier ${product.designation}`}
                          tone="primary"
                          onClick={() => startEditing(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          label={`Supprimer ${product.designation}`}
                          tone="danger"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function ProductionManager({
  categories,
  subCategories,
}: {
  categories: Category[];
  subCategories: any[];
}) {
  const [mode, setMode] = useState<"single" | "range">("single");
  const [selectedDate, setSelectedDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (mode === "single" && !selectedDate) {
        setOrders([]);
        return;
      }
      if (mode === "range" && (!startDate || !endDate)) {
        setOrders([]);
        return;
      }

      setLoading(true);
      try {
        let url = "/api/orders?";
        if (mode === "single") {
          url += `date=${selectedDate}`;
        } else {
          url += `startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [mode, selectedDate, startDate, endDate]);

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

  orders.forEach((order) => {
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

  // Group by category
  const productsByCategory = aggregatedProducts.reduce(
    (acc, product) => {
      const category = product.categoryName || "Sans catégorie";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    },
    {} as Record<string, typeof aggregatedProducts>
  );

  const sortedCategories = Object.keys(productsByCategory).sort();

  const handlePrint = () => {
    window.print();
  };

  const hasData = aggregatedProducts.length > 0;
  const showContent =
    (mode === "single" && selectedDate) ||
    (mode === "range" && startDate && endDate);

  return (
    <Card className="p-6">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
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
      <CardHeader
        title="Production"
        description="Quantités totales à produire pour une date ou une période."
        action={
          hasData ? (
            <Button onClick={handlePrint} variant="secondary">
              <Printer className="h-4 w-4" aria-hidden />
              Imprimer
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 space-y-4">
        <Segmented
          options={[
            { value: "single", label: "Par jour" },
            { value: "range", label: "Par période" },
          ]}
          value={mode}
          onChange={setMode}
        />

        {mode === "single" ? (
          <div>
            <Label htmlFor="production-date">Sélectionner une date</Label>
            <Input
              id="production-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="md:w-64"
            />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <Label htmlFor="production-start">Date de début</Label>
              <Input
                id="production-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="md:w-64"
              />
            </div>
            <div>
              <Label htmlFor="production-end">Date de fin</Label>
              <Input
                id="production-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="md:w-64"
              />
            </div>
          </div>
        )}
      </div>

      {!showContent && (
        <EmptyState
          icon={<ChefHat className="h-6 w-6" aria-hidden />}
          title="Choisissez une date"
          description="Sélectionnez un jour ou une période pour afficher la liste de production."
        />
      )}

      {showContent && (
        <>
          {hasData && (
            <div className="mb-4 p-4 bg-cream/70 rounded-xl border border-line no-print">
              <h4 className="text-xs font-bold text-ink-soft uppercase tracking-wider mb-2.5">
                Filtrer les catégories
              </h4>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {sortedCategories.map((category) => (
                  <label
                    key={category}
                    className="inline-flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-olive cursor-pointer"
                      checked={!hiddenCategories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setHiddenCategories(
                            hiddenCategories.filter((c) => c !== category)
                          );
                        } else {
                          setHiddenCategories([...hiddenCategories, category]);
                        }
                      }}
                    />
                    <span className="ml-2 text-sm text-ink">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div id="printable-production">
            <h3 className="font-display text-lg font-bold text-ink mb-4">
              Total à produire{" "}
              {mode === "single"
                ? `pour le ${new Date(selectedDate).toLocaleDateString()}`
                : `du ${new Date(startDate).toLocaleDateString()} au ${new Date(
                    endDate
                  ).toLocaleDateString()}`}
            </h3>

            {loading ? (
              <LoadingBlock />
            ) : !hasData ? (
              <EmptyState
                icon={<ClipboardList className="h-6 w-6" aria-hidden />}
                title="Aucune commande pour cette sélection"
              />
            ) : (
              <div className="overflow-x-auto border border-line rounded-xl">
                <table className="min-w-full divide-y divide-line">
                  <thead className="bg-parchment/60">
                    <tr>
                      <Th>Produit</Th>
                      <Th>Quantité totale</Th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface divide-y divide-line">
                    {sortedCategories
                      .filter((c) => !hiddenCategories.includes(c))
                      .map((categoryName) => [
                        <tr
                          key={`cat-${categoryName}`}
                          className="bg-gold-soft/50"
                        >
                          <td
                            colSpan={2}
                            className="px-4 py-2.5 whitespace-nowrap text-sm font-bold text-primary uppercase tracking-wide"
                          >
                            {categoryName}
                          </td>
                        </tr>,
                        ...productsByCategory[categoryName].map((item) => (
                          <tr key={item.name}>
                            <Td className="font-medium whitespace-nowrap pl-8">
                              {item.name}
                            </Td>
                            <Td className="font-bold whitespace-nowrap tabular-nums">
                              {item.quantity}
                            </Td>
                          </tr>
                        )),
                      ])}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

function MembersManager() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"org:member" | "org:admin">(
    "org:member"
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/members");
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (members.length >= 4) {
      setError("La limite de 4 membres est atteinte.");
      return;
    }

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Invitation envoyée avec succès.");
        setInviteEmail("");
        setInviteRole("org:member");
        fetchMembers();
      } else {
        setError(data.error || "Erreur lors de l'invitation.");
      }
    } catch (e) {
      setError("Erreur réseau.");
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) return;
    try {
      const res = await fetch("/api/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        fetchMembers();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (e) {
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <Card className="p-6">
      <CardHeader
        title="Gestion des membres"
        description="Invitez jusqu'à 4 membres dans votre organisation."
        action={<Badge tone="gold">{members.length} / 4 membres</Badge>}
      />

      <div className="mb-6">
        <form
          onSubmit={handleInvite}
          className="flex flex-col sm:flex-row gap-3 sm:items-end"
        >
          <div className="flex-1">
            <Label htmlFor="invite-email">Inviter un membre (email)</Label>
            <Input
              id="invite-email"
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@exemple.com"
            />
          </div>
          <div className="sm:w-40">
            <Label htmlFor="invite-role">Rôle</Label>
            <Select
              id="invite-role"
              value={inviteRole}
              onChange={(e) =>
                setInviteRole(e.target.value as "org:member" | "org:admin")
              }
            >
              <option value="org:member">Membre</option>
              <option value="org:admin">Admin</option>
            </Select>
          </div>
          <Button type="submit" disabled={members.length >= 4}>
            Inviter
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-danger text-sm mt-2">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="text-olive-dark text-sm mt-2">
            {success}
          </p>
        )}
      </div>

      {loading ? (
        <LoadingBlock label="Chargement des membres..." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-parchment/60">
              <tr>
                <Th>Utilisateur</Th>
                <Th>Email</Th>
                <Th>Rôle</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-line">
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-cream/60 transition-colors"
                >
                  <Td className="whitespace-nowrap">
                    <div className="flex items-center">
                      {member.imageUrl && (
                        <Image
                          src={member.imageUrl}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full mr-3"
                        />
                      )}
                      <span className="font-semibold">
                        {member.firstName} {member.lastName}
                      </span>
                    </div>
                  </Td>
                  <Td className="text-ink-soft whitespace-nowrap">
                    {member.email}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <Badge
                      tone={member.role === "org:admin" ? "gold" : "neutral"}
                    >
                      {member.role === "org:member" ? "Membre" : "Admin"}
                    </Badge>
                  </Td>
                  <Td className="text-right whitespace-nowrap">
                    {member.role !== "org:admin" && (
                      <IconButton
                        label={`Supprimer ${member.firstName} ${member.lastName}`}
                        tone="danger"
                        onClick={() => handleRemove(member.userId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
