"use client";

import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { ChevronLeft, LayoutDashboard } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Button, IconButton } from "../../components/ui";
import { OrdersManager } from "../../components/OrdersManager";

export default function CommandesPage() {
  const { user } = useApp();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="px-4 bg-surface border-b border-line flex items-center gap-3 shrink-0 h-16">
        <IconButton
          label="Retour à la prise de commande"
          onClick={() => router.push("/user")}
        >
          <ChevronLeft className="h-5 w-5" />
        </IconButton>
        <Image
          src="/logo.png"
          alt="Logo Cahier du Chef"
          width={32}
          height={32}
          className="h-8 w-8"
        />
        <h1 className="font-display text-lg sm:text-xl font-bold text-ink">
          Commandes
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

      <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto">
        <OrdersManager />
      </main>
    </div>
  );
}
