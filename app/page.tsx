import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import JobTitleRotator from "./components/JobTitleRotator";
import {
  ChefHat,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "LG Order Register - Gestion de commandes pour Traiteurs et Métiers de Bouche",
  description:
    "Optimisez votre activité de traiteur, boulangerie ou restaurant avec LG Order Register. Génération de menus, listes de production et gestion d'équipe simplifiée.",
  openGraph: {
    title:
      "LG Order Register - La solution tout-en-un pour les métiers de bouche",
    description:
      "Gagnez du temps sur vos commandes et votre production. Essayez gratuitement.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="LG Order Register Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">
                LG Order Register
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Se connecter
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white pt-16 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block">Gérez vos commandes</span>
                <JobTitleRotator />
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Une solution tout-en-un pour les professionnels des métiers de
                bouche. De la génération de menus à la liste de production,
                gagnez du temps et évitez les erreurs.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-all shadow-lg hover:shadow-xl"
                >
                  Démarrer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md overflow-hidden">
                {/* 
                  PLACEHOLDER SCREENSHOT: DASHBOARD PRINCIPAL
                  Screenshot à faire : Vue d'ensemble du tableau de bord admin montrant les onglets (Menu, Produits, Commandes, etc.)
                  et peut-être la liste des catégories ou des produits.
                  Cela montre l'interface claire et organisée.
                */}
                <div className="bg-gray-100 aspect-video flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center p-6">
                    <LayoutDashboard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Screenshot: Tableau de bord Admin
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50 overflow-hidden lg:py-24">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="relative">
            <h2 className="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Tout ce dont vous avez besoin pour réussir
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">
              Des fonctionnalités pensées pour optimiser votre flux de travail,
              de la commande client à la livraison.
            </p>
          </div>

          <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div className="relative">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                Génération de Menu Intelligente
              </h3>
              <p className="mt-3 text-lg text-gray-500">
                Importez vos fichiers PDF et laissez notre IA extraire
                automatiquement les catégories et les produits. Plus besoin de
                saisie manuelle fastidieuse.
              </p>

              <dl className="mt-10 space-y-10">
                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <FileText className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      Import PDF & OCR
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Transformez vos cartes statiques en base de données produits
                    exploitable en quelques secondes.
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-10 -mx-4 relative lg:mt-0">
              {/* 
                PLACEHOLDER SCREENSHOT: GÉNÉRATION DE MENU
                Screenshot à faire : L'interface d'upload de fichier PDF dans l'onglet "Menu" 
                ou le résultat de l'importation avec les catégories générées.
                Montre la simplicité de l'import.
              */}
              <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 mx-4">
                <div className="bg-gray-100 aspect-4/3 flex items-center justify-center border-2 border-dashed border-gray-300 m-4 rounded-lg">
                  <div className="text-center p-6">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Screenshot: Import & Génération Menu
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-12 sm:mt-16 lg:mt-24">
            <div className="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div className="lg:col-start-2">
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                  Suivi de Production Précis
                </h3>
                <p className="mt-3 text-lg text-gray-500">
                  Générez automatiquement les listes de production pour votre
                  cuisine. Sachez exactement quoi préparer, jour par jour ou sur
                  une période donnée.
                </p>

                <dl className="mt-10 space-y-10">
                  <div className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                        <ClipboardList className="h-6 w-6" />
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                        Listes consolidées
                      </p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">
                      Visualisez les quantités totales par produit pour éviter
                      le gaspillage et les oublis.
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-10 -mx-4 relative lg:mt-0 lg:col-start-1">
                {/* 
                  PLACEHOLDER SCREENSHOT: LISTE DE PRODUCTION
                  Screenshot à faire : L'onglet "Production" montrant le tableau récapitulatif 
                  des quantités à produire pour une date donnée.
                  Montre l'utilité concrète pour la cuisine.
                */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 mx-4">
                  <div className="bg-gray-100 aspect-4/3 flex items-center justify-center border-2 border-dashed border-gray-300 m-4 rounded-lg">
                    <div className="text-center p-6">
                      <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        Screenshot: Liste de Production
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Collaboration simplifiée
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Invitez votre équipe et gérez les rôles facilement.
            </p>
          </div>
          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
            <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Gestion d&apos;équipe
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Invitez des membres par email et assignez des rôles (Admin ou
                Membre) en un clic.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Prise de commande
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Interface dédiée pour la prise de commande rapide par vos
                équipes de vente.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 text-purple-600 mb-4">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Vue d&apos;ensemble
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Suivez toutes les commandes à venir et passées depuis un tableau
                de bord centralisé.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Prêt à optimiser votre activité ?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Rejoignez les traiteurs qui gagnent du temps chaque jour avec LG
            Order Register.
          </p>
          <Link
            href="/login"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto transition-colors"
          >
            Créer mon compte gratuitement
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="LG Order Register Logo"
                width={24}
                height={24}
                className="h-6 w-6 grayscale opacity-50"
              />
              <span className="ml-2 text-gray-500 font-medium">
                LG Order Register
              </span>
            </div>
            <p className="text-center text-base text-gray-400">
              &copy; 2026 LG Order Register. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
