/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button, Input, Label, LoadingBlock } from "../components/ui";

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const { orgRole } = useAuth();
  useEffect(() => {
    if (orgRole) {
      if (orgRole === "org:admin") {
        router.push("/admin");
      }
      if (orgRole === "org:user") {
        router.push("/user");
      }
    }
  }, [orgRole, router]);
  const [view, setView] = useState<
    "sign-in" | "forgot-password" | "reset-password" | "verify-2fa"
  >("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <LoadingBlock />
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      } else if (
        result.status === "needs_second_factor" ||
        result.status === "needs_client_trust"
      ) {
        // Check if email_code is supported
        const isEmailCodeSupported = result.supportedSecondFactors?.some(
          (f) => f.strategy === "email_code"
        );
        if (isEmailCodeSupported) {
          // Prepare the second factor
          await signIn.prepareSecondFactor({ strategy: "email_code" });
          setView("verify-2fa");
          // Clear password from state for security, though not strictly necessary if we don't use it again
          setPassword("");
        } else {
          setError(
            "Méthode d'authentification à deux facteurs non supportée (Email requis)."
          );
        }
      } else {
        console.log("SignIn status:", result.status);
      }
    } catch (err: any) {
      console.error("SignIn error:", err);
      if (isClerkAPIResponseError(err)) {
        const msg = err.errors[0]?.longMessage || "Une erreur est survenue.";
        setError(msg);
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySecondFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      } else {
        console.log("Verify2FA status:", result.status);
        setError("Vérification incomplète. Statut: " + result.status);
      }
    } catch (err: any) {
      console.error("Verify2FA error:", err);
      if (isClerkAPIResponseError(err)) {
        setError(
          err.errors[0]?.longMessage ||
            "Erreur lors de la vérification du code."
        );
      } else {
        setError("Erreur lors de la vérification du code.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await signIn
        .create({
          strategy: "reset_password_email_code",
          identifier: email,
        })
        .then(() => {
          setView("reset-password");
          setError("");
        });
    } catch (err: any) {
      console.error("ForgotPassword error:", err);
      if (isClerkAPIResponseError(err)) {
        setError(
          err.errors[0]?.longMessage || "Erreur lors de l'envoi du code."
        );
      } else {
        setError("Erreur lors de l'envoi du code.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn
        .attemptFirstFactor({
          strategy: "reset_password_email_code",
          code,
          password: newPassword,
        })
        .then(async (result) => {
          if (
            result.status === "needs_second_factor" ||
            result.status === "needs_client_trust"
          ) {
            const isEmailCodeSupported = result.supportedSecondFactors?.some(
              (f) => f.strategy === "email_code"
            );
            if (isEmailCodeSupported) {
              await signIn.prepareSecondFactor({ strategy: "email_code" });
              setView("verify-2fa");
              setPassword("");
            } else {
              setError(
                "Méthode d'authentification à deux facteurs non supportée (Email requis)."
              );
            }
          }

          if (result.status === "complete") {
            await setActive({
              session: result.createdSessionId,
              navigate: async ({ session }) => {
                if (session?.currentTask) {
                  // Check for tasks and navigate to custom UI to help users resolve them
                  // See https://clerk.com/docs/guides/development/custom-flows/overview#session-tasks
                  console.log(session?.currentTask);
                  return;
                }

                router.push("/");
              },
            });
          }
        });
    } catch (err: any) {
      console.error("ResetPassword error:", err);
      if (isClerkAPIResponseError(err)) {
        setError(
          err.errors[0]?.longMessage || "Erreur lors de la réinitialisation."
        );
      } else {
        setError("Erreur lors de la réinitialisation.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Retour à l&apos;accueil
          </Link>
        </div>

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
              {view === "sign-in" && "Connexion"}
              {view === "forgot-password" && "Mot de passe oublié"}
              {view === "reset-password" && "Réinitialisation"}
              {view === "verify-2fa" && "Vérification 2FA"}
            </h1>
            {view === "sign-in" && (
              <p className="mt-2 text-center text-sm text-ink-soft">
                Connectez-vous à votre compte Cahier du Chef
              </p>
            )}
            {view === "forgot-password" && (
              <p className="mt-2 text-center text-sm text-ink-soft">
                Saisissez votre email pour recevoir un code de réinitialisation.
              </p>
            )}
            {view === "verify-2fa" && (
              <p className="mt-2 text-center text-sm text-ink-soft">
                Un code de vérification a été envoyé à votre adresse email.
              </p>
            )}
          </div>

          {successMessage && (
            <div className="bg-olive-soft border border-olive/30 text-olive-dark px-4 py-3 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="bg-danger-soft border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm"
            >
              {error}
              <button
                onClick={() => {
                  setView("forgot-password");
                  setError("");
                  setSuccessMessage("");
                }}
                className="underline ml-2 hover:text-danger-dark cursor-pointer"
              >
                Réinitialiser ?
              </button>
            </div>
          )}

          {view === "sign-in" && (
            <form className="space-y-5" onSubmit={handleSignIn}>
              <div>
                <Label htmlFor="email-address">Adresse email</Label>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="vous@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setView("forgot-password");
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <Button type="submit" loading={loading} className="w-full">
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          )}

          {view === "forgot-password" && (
            <form className="space-y-5" onSubmit={handleForgotPassword}>
              <div>
                <Label htmlFor="email-address-reset">Adresse email</Label>
                <Input
                  id="email-address-reset"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setView("sign-in");
                    setError("");
                    setSuccessMessage("");
                  }}
                >
                  Retour
                </Button>
                <Button type="submit" loading={loading}>
                  {loading ? "Envoi..." : "Envoyer le code"}
                </Button>
              </div>
            </form>
          )}

          {view === "reset-password" && (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <div>
                <Label htmlFor="code">Code de vérification</Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  required
                  placeholder="Entrez le code reçu par email"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setView("forgot-password");
                    setError("");
                    setSuccessMessage("");
                  }}
                >
                  Retour
                </Button>
                <Button type="submit" loading={loading}>
                  {loading
                    ? "Réinitialisation..."
                    : "Réinitialiser le mot de passe"}
                </Button>
              </div>
            </form>
          )}
          {view === "verify-2fa" && (
            <form className="space-y-5" onSubmit={handleVerifySecondFactor}>
              <div>
                <Label htmlFor="code-2fa">Code de vérification</Label>
                <Input
                  id="code-2fa"
                  name="code"
                  type="text"
                  required
                  placeholder="Entrez le code reçu par email"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setView("sign-in");
                    setError("");
                    setCode("");
                  }}
                >
                  Retour
                </Button>
                <Button type="submit" loading={loading}>
                  {loading ? "Vérification..." : "Vérifier"}
                </Button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Créer une organisation
          </Link>
        </p>
      </div>
    </div>
  );
}
