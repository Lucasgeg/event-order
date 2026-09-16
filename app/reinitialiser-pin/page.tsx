"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button, Label } from "../components/ui";
import { PinInput } from "../components/PinInput";

function ResetPinContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Lien de réinitialisation invalide.");
      return;
    }
    if (!/^\d{6}$/.test(newPin)) {
      setError("Le code PIN doit comporter 6 chiffres.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("Les deux codes PIN ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin-session/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPin }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 bg-cream">
        <div className="w-full max-w-md">
          <div className="bg-surface rounded-2xl border border-line shadow-sm py-10 px-8 text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-olive-soft text-olive-dark mb-5">
              <CheckCircle2 className="h-7 w-7" aria-hidden />
            </div>
            <h2 className="font-display text-2xl font-bold text-ink mb-3">
              Code PIN réinitialisé
            </h2>
            <p className="text-ink-soft mb-8">
              Votre nouveau code PIN est actif. Il vous sera redemandé à la
              prochaine entrée dans l&apos;espace admin.
            </p>
            <Link
              href="/user"
              className="inline-flex items-center justify-center h-11 px-5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Retour à la prise de commande
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 bg-cream">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl border border-line shadow-sm px-6 py-8 sm:px-10">
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/logo.png"
              alt="Cahier du Chef Logo"
              width={56}
              height={56}
              className="h-14 w-14"
            />
            <h1 className="mt-4 text-center font-display text-2xl font-bold tracking-tight text-ink">
              Nouveau code PIN
            </h1>
            <p className="mt-2 text-center text-sm text-ink-soft">
              Choisissez un nouveau code PIN admin à 6 chiffres.
            </p>
          </div>

          {!token && (
            <div
              role="alert"
              className="rounded-lg bg-danger-soft border border-danger/20 px-4 py-3 mb-6"
            >
              <p className="text-sm text-danger">
                Lien de réinitialisation invalide ou incomplet.
              </p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label>Nouveau code PIN</Label>
              <PinInput value={newPin} onChange={setNewPin} disabled={!token} />
            </div>
            <div>
              <Label>Confirmer le code PIN</Label>
              <PinInput
                value={confirmPin}
                onChange={setConfirmPin}
                disabled={!token}
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg bg-danger-soft border border-danger/20 px-4 py-3"
              >
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={!token}
              className="w-full"
            >
              {loading ? "Réinitialisation..." : "Définir ce code PIN"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-cream text-ink-soft">
          Chargement...
        </div>
      }
    >
      <ResetPinContent />
    </Suspense>
  );
}
