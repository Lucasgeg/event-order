/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button, Input, Label } from "../components/ui";

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    organisationName: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
    adminConfirmPassword: "",
    memberFirstName: "",
    memberLastName: "",
    memberEmail: "",
    memberPassword: "",
    memberConfirmPassword: "",
    promoCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (
      formData.adminEmail.trim().toLowerCase() ===
      formData.memberEmail.trim().toLowerCase()
    ) {
      setError("L'email admin et l'email membre doivent être différents.");
      return;
    }

    if (formData.adminPassword !== formData.adminConfirmPassword) {
      setError(
        "Les deux mots de passe de l'administrateur ne correspondent pas."
      );
      return;
    }

    if (formData.memberPassword !== formData.memberConfirmPassword) {
      setError("Les deux mots de passe du membre ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        organisationName: formData.organisationName,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        memberFirstName: formData.memberFirstName,
        memberLastName: formData.memberLastName,
        memberEmail: formData.memberEmail,
        memberPassword: formData.memberPassword,
        promoCode: formData.promoCode,
      };
      const response = await fetch("/api/public/create-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Une erreur est survenue lors de l'inscription."
        );
      }

      setSuccess(true);
      // Optional: redirect after success or show success message
      // setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream">
        <div className="w-full max-w-md">
          <div className="bg-surface rounded-2xl border border-line shadow-sm py-10 px-8 text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-olive-soft text-olive-dark mb-5">
              <CheckCircle2 className="h-7 w-7" aria-hidden />
            </div>
            <h2 className="font-display text-2xl font-bold text-ink mb-3">
              Inscription réussie !
            </h2>
            <p className="text-ink-soft mb-8">
              Votre organisation a été créée avec succès. Un email de
              bienvenue a été envoyé à l&apos;administrateur et au membre.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-11 px-5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Retour à l&apos;accueil
          </Link>
        </div>

        <div className="bg-surface rounded-2xl border border-line shadow-sm px-6 py-8 sm:px-10">
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/logo.png"
              alt="Cahier du Chef Logo"
              width={56}
              height={56}
              className="h-14 w-14"
            />
            <h1 className="mt-4 text-center font-display text-3xl font-bold tracking-tight text-ink">
              Créer un compte
            </h1>
            <p className="mt-2 text-center text-sm text-ink-soft">
              Créez votre organisation et invitez votre premier membre.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Organisation */}
            <div>
              <Label htmlFor="organisationName">
                Nom de l&apos;organisation
              </Label>
              <Input
                id="organisationName"
                name="organisationName"
                type="text"
                required
                placeholder="Ex. Boulangerie Martin"
                value={formData.organisationName}
                onChange={handleChange}
              />
            </div>

            <fieldset className="border-t border-line pt-5">
              <legend className="font-display text-lg font-bold text-ink pr-3">
                Administrateur
              </legend>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="adminFirstName">Prénom</Label>
                  <Input
                    type="text"
                    name="adminFirstName"
                    id="adminFirstName"
                    required
                    value={formData.adminFirstName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="adminLastName">Nom</Label>
                  <Input
                    type="text"
                    name="adminLastName"
                    id="adminLastName"
                    required
                    value={formData.adminLastName}
                    onChange={handleChange}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input
                    id="adminEmail"
                    name="adminEmail"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.adminEmail}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="adminPassword">Mot de passe</Label>
                  <Input
                    id="adminPassword"
                    name="adminPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.adminPassword}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="adminConfirmPassword">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="adminConfirmPassword"
                    name="adminConfirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.adminConfirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="border-t border-line pt-5">
              <legend className="font-display text-lg font-bold text-ink pr-3">
                Membre
              </legend>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="memberFirstName">Prénom</Label>
                  <Input
                    type="text"
                    name="memberFirstName"
                    id="memberFirstName"
                    required
                    value={formData.memberFirstName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="memberLastName">Nom</Label>
                  <Input
                    type="text"
                    name="memberLastName"
                    id="memberLastName"
                    required
                    value={formData.memberLastName}
                    onChange={handleChange}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="memberEmail">Email</Label>
                  <Input
                    id="memberEmail"
                    name="memberEmail"
                    type="email"
                    required
                    value={formData.memberEmail}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="memberPassword">Mot de passe</Label>
                  <Input
                    id="memberPassword"
                    name="memberPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.memberPassword}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="memberConfirmPassword">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="memberConfirmPassword"
                    name="memberConfirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.memberConfirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </fieldset>

            {/* Code Promo */}
            <div className="border-t border-line pt-5">
              <Label htmlFor="promoCode">Code promo (optionnel)</Label>
              <Input
                id="promoCode"
                name="promoCode"
                type="text"
                value={formData.promoCode}
                onChange={handleChange}
                placeholder="Code promo"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg bg-danger-soft border border-danger/20 px-4 py-3"
              >
                <h3 className="text-sm font-semibold text-danger">Erreur</h3>
                <p className="mt-1 text-sm text-danger">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {loading ? "Création en cours..." : "Créer l'organisation"}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-surface px-3 text-ink-soft">
                  Déjà un compte ?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="flex w-full items-center justify-center h-11 rounded-lg border border-line bg-surface px-4 text-sm font-semibold text-ink hover:bg-parchment transition-colors"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
