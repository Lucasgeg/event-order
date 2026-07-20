"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { Order } from "@/app/types";
import {
  ClipboardList,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Button,
  Card,
  IconButton,
  Input,
  Badge,
  EmptyState,
  Segmented,
  Th,
  Td,
  LoadingBlock,
} from "@/app/components/ui";

export function OrdersManager() {
  const { user } = useApp();
  // L'API refuse PUT/DELETE aux non-admins ; ici on ne fait que refléter la règle
  const canEdit = user?.role === "admin";

  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchOrders = async (
    targetPage: number = 1,
    query: string = "",
    period: "upcoming" | "past" = activeTab
  ) => {
    setLoading(true);
    try {
      let url = `/api/orders?page=${targetPage}&limit=10&period=${period}`;
      if (query) {
        url += `&clientName=${encodeURIComponent(query)}`;
      }
      if (selectedDate) {
        url += `&date=${selectedDate}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
        setPage(data.pagination.page);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, "", activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); // Fetch when switching tabs

  const handleSearch = () => {
    setPage(1);
    fetchOrders(1, searchQuery, activeTab);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchOrders(newPage, searchQuery, activeTab);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="font-display text-xl font-bold text-ink">
          Gestion des commandes
        </h2>

        <Segmented
          options={[
            { value: "upcoming", label: "À venir" },
            { value: "past", label: "Passées" },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-3 w-full mb-6">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="md:w-48"
          aria-label="Filtrer par date"
        />

        <div className="relative md:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft pointer-events-none"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="pl-9"
            aria-label="Rechercher un client"
          />
        </div>
        <Button onClick={handleSearch} variant="secondary">
          Rechercher
        </Button>
      </div>

      {loading ? (
        <LoadingBlock label="Chargement des commandes..." />
      ) : (
        <>
          {orders.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-6 w-6" aria-hidden />}
              title="Aucune commande trouvée"
              description={
                activeTab === "upcoming"
                  ? "Les commandes à venir apparaîtront ici."
                  : "Les commandes passées apparaîtront ici."
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="min-w-full divide-y divide-line">
                <thead className="bg-parchment/60">
                  <tr>
                    <Th>Client</Th>
                    <Th>Date de retrait</Th>
                    <Th>Produits</Th>
                    <Th>Total</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-line">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-cream/60 transition-colors"
                    >
                      <Td className="font-semibold whitespace-nowrap">
                        {order.clientName}
                      </Td>
                      <Td className="whitespace-nowrap">
                        <Badge tone="gold">
                          {new Date(order.pickupDate).toLocaleDateString()}
                        </Badge>
                      </Td>
                      <Td>
                        <ul className="space-y-0.5 text-ink-soft">
                          {order.items.map((item, idx) => (
                            <li key={idx}>
                              <span className="font-semibold text-ink tabular-nums">
                                {item.quantity}×
                              </span>{" "}
                              {item.designation}
                            </li>
                          ))}
                        </ul>
                      </Td>
                      <Td className="font-bold whitespace-nowrap tabular-nums">
                        {order.items
                          .reduce(
                            (acc, item) => acc + item.unitPrice * item.quantity,
                            0
                          )
                          .toFixed(2)}{" "}
                        €
                      </Td>
                      <Td className="text-right whitespace-nowrap">
                        <div className="inline-flex gap-1">
                          <IconButton
                            label={
                              canEdit
                                ? `Modifier la commande de ${order.clientName}`
                                : "Réservé aux administrateurs"
                            }
                            tone="primary"
                            disabled={!canEdit}
                            onClick={() =>
                              router.push(`/user?orderId=${order.id}`)
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            label={
                              canEdit
                                ? `Supprimer la commande de ${order.clientName}`
                                : "Réservé aux administrateurs"
                            }
                            tone="danger"
                            disabled={!canEdit}
                            onClick={() => {
                              if (
                                confirm("Voulez-vous supprimer cette commande ?")
                              ) {
                                fetch(`/api/orders/${order.id}`, {
                                  method: "DELETE",
                                }).then(() => fetchOrders(page, searchQuery));
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Précédent
              </Button>
              <span className="text-sm text-ink-soft">
                Page <span className="font-bold text-ink">{page}</span> sur{" "}
                <span className="font-bold text-ink">{totalPages}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Suivant
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
