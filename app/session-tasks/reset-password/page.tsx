"use client";

import { useEffect, useState } from "react";
import { useAuth, useClerk, useSession } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Input, Label, LoadingBlock } from "../../components/ui";

export default function ResetPasswordTaskPage() {
  const { isLoaded, session } = useSession();
  const { orgRole } = useAuth();
  const { setActive } = useClerk();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const hasPendingResetPasswordTask =
    session?.currentTask?.key === "reset-password";

  useEffect(() => {
    if (!isLoaded) return;

    if (!session) {
      // Juste après une navigation client-side vers cette page, `session`
      // peut rester momentanément null le temps que le SDK Clerk resynchronise
      // la session pending fraîchement activée (isLoaded, lui, est déjà true
      // globalement). On laisse une marge avant de traiter ça comme un vrai
      // utilisateur non connecté.
      const timeout = setTimeout(() => router.replace("/login"), 800);
      return () => clearTimeout(timeout);
    }

    if (!hasPendingResetPasswordTask) {
      if (orgRole === "org:admin") {
        router.replace("/admin");
      } else if (orgRole) {
        router.replace("/user");
      }
    }
  }, [isLoaded, session, hasPendingResetPasswordTask, orgRole, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmNewPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await session!.user.updatePassword({ newPassword });
      // Rejoue setActive (et pas juste session.reload()) pour que Clerk
      // commite la session comme pleinement active côté serveur (cookie lu
      // par auth()) une fois la tâche résolue.
      const { id } = await session!.reload();
      await setActive({ session: id });
    } catch (err: unknown) {
      console.error("Reset password task error:", err);
      if (isClerkAPIResponseError(err)) {
        setError(
          err.errors[0]?.longMessage || "Erreur lors de la réinitialisation.",
        );
      } else {
        setError("Erreur lors de la réinitialisation.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !session || !hasPendingResetPasswordTask) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <LoadingBlock />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl border border-line shadow-sm p-8 space-y-6">
          <div>
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="Cahier du Chef Logo"
                width={64}
                height={64}
                className="h-16 w-16"
              />
            </div>
            <h1 className="mt-5 text-center font-display text-3xl font-bold tracking-tight text-ink">
              Nouveau mot de passe requis
            </h1>
            <p className="mt-2 text-center text-sm text-ink-soft">
              Pour des raisons de sécurité, vous devez choisir un nouveau mot de
              passe avant de continuer.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="bg-danger-soft border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="task-new-password">Nouveau mot de passe</Label>
              <Input
                id="task-new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="task-confirm-new-password">
                Confirmer le mot de passe
              </Label>
              <Input
                id="task-confirm-new-password"
                name="confirmNewPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>

            <Button type="submit" loading={loading} className="w-full">
              {loading
                ? "Réinitialisation..."
                : "Réinitialiser le mot de passe"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
