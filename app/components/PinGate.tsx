"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { PinInput } from "./PinInput";
import { Button, Card } from "./ui";

interface VerifyErrorBody {
  error?: string;
  attemptsRemaining?: number;
  lockedUntil?: string;
}

export function PinGate() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  const submit = async (value: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: value }),
      });

      if (res.ok) {
        router.refresh();
        return;
      }

      const data: VerifyErrorBody = await res.json();

      if (res.status === 429) {
        setLockedUntil(data.lockedUntil ?? null);
      } else if (data.attemptsRemaining !== undefined) {
        const n = data.attemptsRemaining;
        setError(`Code PIN incorrect (${n} essai${n > 1 ? "s" : ""} restant${n > 1 ? "s" : ""})`);
      } else {
        setError(data.error || "Code PIN incorrect");
      }
    } catch {
      setError("Erreur réseau, réessayez.");
    } finally {
      setPin("");
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    try {
      const res = await fetch("/api/admin-session/forgot", { method: "POST" });
      if (res.ok) {
        setForgotSent(true);
        toast.success("Email de réinitialisation envoyé.");
      } else {
        toast.error("Impossible d'envoyer l'email de réinitialisation.");
      }
    } catch {
      toast.error("Erreur réseau.");
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <Card className="p-8 w-full max-w-sm text-center">
        <Image
          src="/logo.png"
          alt="Logo Cahier du Chef"
          width={48}
          height={48}
          className="mx-auto mb-4 h-12 w-12"
        />
        <h1 className="font-display text-xl font-bold text-ink mb-1">
          Espace admin
        </h1>
        <p className="text-sm text-ink-soft mb-6">
          Entrez le code PIN à 6 chiffres.
        </p>

        {lockedUntil ? (
          <p className="text-sm text-danger" role="alert">
            Accès verrouillé suite à plusieurs échecs. Réessayez après{" "}
            {new Date(lockedUntil).toLocaleTimeString("fr-FR")}.
          </p>
        ) : (
          <>
            <PinInput
              value={pin}
              onChange={setPin}
              onComplete={submit}
              disabled={loading}
              autoFocus
            />
            {error && (
              <p className="text-sm text-danger mt-3" role="alert">
                {error}
              </p>
            )}
          </>
        )}

        <div className="mt-6">
          {forgotSent ? (
            <p className="text-sm text-ink-soft">Vérifiez votre boîte mail.</p>
          ) : (
            <Button variant="outline" size="sm" onClick={handleForgot}>
              PIN oublié ?
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
