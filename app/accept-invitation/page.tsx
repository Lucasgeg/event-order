/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSignUp, useUser, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button, Input, Label, LoadingBlock } from "../components/ui";

function AcceptInvitationContent() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticket =
    searchParams.get("__clerk_ticket") || searchParams.get("ticket");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && !ticket) {
      setError("Ticket d'invitation manquant ou invalide.");
    }
  }, [isLoaded, ticket]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <LoadingBlock />
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-surface rounded-2xl border border-line shadow-sm p-8 space-y-5 text-center">
          <h2 className="font-display text-xl font-bold text-ink">
            Vous êtes déjà connecté
          </h2>
          <p className="text-ink-soft">
            Connecté en tant que {user?.primaryEmailAddress?.emailAddress}
          </p>
          <p className="text-sm text-ink-soft">
            Pour accepter cette invitation avec un nouveau compte, veuillez vous
            déconnecter.
          </p>
          <Button variant="danger" onClick={() => signOut()}>
            Se déconnecter
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) {
      setError("Ticket d'invitation manquant.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Create the sign up with the ticket
      const result = await signUp.create({
        strategy: "ticket",
        ticket,
        firstName,
        lastName,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        console.log(result);
        setError("L'inscription n'a pas pu être finalisée.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.errors?.[0]?.code === "form_identifier_exists") {
        setError(
          "Un compte existe déjà avec cet email. Veuillez vous connecter."
        );
      } else {
        setError(err.errors?.[0]?.message || "Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-surface rounded-2xl border border-line shadow-sm p-8 space-y-6">
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
          <h1 className="mt-5 text-center font-display text-3xl font-bold text-ink">
            Accepter l&apos;invitation
          </h1>
          <p className="mt-2 text-center text-sm text-ink-soft">
            Créez votre compte pour rejoindre l&apos;organisation
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="bg-danger-soft border border-danger/20 text-danger rounded-lg px-4 py-3 text-sm"
          >
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              required
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              required
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="8 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div id="clerk-captcha" />

          <Button
            type="submit"
            loading={loading}
            disabled={!ticket}
            className="w-full"
          >
            {loading ? "Création du compte..." : "Créer mon compte"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-cream">
          <LoadingBlock />
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
