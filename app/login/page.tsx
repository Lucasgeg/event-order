/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">Chargement...</div>
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
      } else if (result.status === "needs_second_factor") {
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
          if (result.status === "needs_second_factor") {
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 shadow rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {view === "sign-in" && "Connexion"}
            {view === "forgot-password" && "Mot de passe oublié"}
            {view === "reset-password" && "Réinitialisation"}
            {view === "verify-2fa" && "Vérification 2FA"}
          </h2>
          {view === "sign-in" && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Connectez-vous à votre compte Event Order
            </p>
          )}
          {view === "verify-2fa" && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Un code de vérification a été envoyé à votre adresse email.
            </p>
          )}
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded relative text-sm">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative text-sm">
            {error}
            <button
              onClick={() => {
                setView("forgot-password");
                setError("");
                setSuccessMessage("");
              }}
              className="underline ml-2 hover:text-red-800"
            >
              Réinitialiser ?
            </button>
          </div>
        )}

        {view === "sign-in" && (
          <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Adresse email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setView("forgot-password");
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </div>
          </form>
        )}

        {view === "forgot-password" && (
          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label
                htmlFor="email-address-reset"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Adresse email
              </label>
              <div className="mt-2">
                <input
                  id="email-address-reset"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setView("sign-in");
                  setError("");
                  setSuccessMessage("");
                }}
                className="text-sm font-medium text-gray-600 hover:text-gray-500"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 tline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {loading ? "Envoi..." : "Envoyer le code"}
              </button>
            </div>
          </form>
        )}

        {view === "reset-password" && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Code de vérification
                </label>
                <div className="mt-2">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                    placeholder="Entrez le code reçu par email"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Nouveau mot de passe
                </label>
                <div className="mt-2">
                  <input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setView("forgot-password");
                  setError("");
                  setSuccessMessage("");
                }}
                className="text-sm font-medium text-gray-600 hover:text-gray-500"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {loading
                  ? "Réinitialisation..."
                  : "Réinitialiser le mot de passe"}
              </button>
            </div>
          </form>
        )}
        {view === "verify-2fa" && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifySecondFactor}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="code-2fa"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Code de vérification
                </label>
                <div className="mt-2">
                  <input
                    id="code-2fa"
                    name="code"
                    type="text"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                    placeholder="Entrez le code reçu par email"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setView("sign-in");
                  setError("");
                  setCode("");
                }}
                className="text-sm font-medium text-gray-600 hover:text-gray-500"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {loading ? "Vérification..." : "Vérifier"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
