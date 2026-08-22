import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import JobTitleRotator from "./components/JobTitleRotator";
import ClickableImage from "./components/ClickableImage";
import {
  ChefHat,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "Cahier du Chef - Gestion de commandes pour Traiteurs et Métiers de Bouche",
  description:
    "Optimisez votre activité de traiteur, boulangerie ou restaurant avec Cahier du Chef. Génération de menus, listes de production et gestion d'équipe simplifiée.",
  openGraph: {
    title: "Cahier du Chef - La solution tout-en-un pour les métiers de bouche",
    description:
      "Gagnez du temps sur vos commandes et votre production. Essayez gratuitement.",
    type: "website",
    locale: "fr_FR",
  },
};

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="bg-cream/90 backdrop-blur border-b border-line sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Cahier du Chef Logo"
                width={36}
                height={36}
                className="h-9 w-9"
              />
              <span className="ml-2.5 font-display text-xl font-bold text-ink">
                Cahier du Chef
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/a-propos"
                className="hidden sm:block text-ink-soft hover:text-ink font-medium transition-colors"
              >
                À propos
              </Link>
              {userId ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center h-10 px-4 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
                >
                  Accéder à l&apos;application
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-ink-soft hover:text-ink font-medium transition-colors"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/inscription"
                    className="inline-flex items-center h-10 px-4 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Commencer
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-sm font-semibold text-gold-dark mb-6">
                <ChefHat className="h-4 w-4" aria-hidden />
                Pensé par un ancien restaurateur
              </span>
              <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl xl:text-6xl">
                <span className="block">Gérez vos commandes</span>
                <JobTitleRotator />
              </h1>
              <p className="mt-5 text-lg text-ink-soft sm:max-w-xl sm:mx-auto md:text-xl lg:mx-0 leading-relaxed">
                Une solution tout-en-un pour les professionnels des métiers de
                bouche. De la génération de menus à la liste de production,
                gagnez du temps et évitez les erreurs.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Link
                  href={userId ? "/admin" : "/inscription"}
                  className="inline-flex items-center justify-center h-13 px-8 py-3.5 rounded-lg text-base font-semibold text-white bg-primary hover:bg-primary-dark md:text-lg md:px-10 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25"
                >
                  {userId ? "Accéder à l'application" : "Démarrer maintenant"}
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                </Link>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-xl shadow-xl ring-1 ring-line lg:max-w-md overflow-hidden bg-surface">
                <ClickableImage
                  src="/AdminDashboard.png"
                  alt="Interface du tableau de bord Cahier du Chef"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-surface border-y border-line overflow-hidden lg:py-24">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="relative">
            <h2 className="text-center font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Tout ce dont vous avez besoin pour réussir
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-center text-lg text-ink-soft">
              Des fonctionnalités pensées pour optimiser votre flux de travail,
              de la commande client à la livraison.
            </p>
          </div>

          <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div className="relative">
              <h3 className="font-display text-2xl font-bold text-ink tracking-tight sm:text-3xl">
                Génération de Menu Intelligente
              </h3>
              <p className="mt-3 text-lg text-ink-soft leading-relaxed">
                Importez vos fichiers PDF et laissez notre IA extraire
                automatiquement les catégories et les produits. Plus besoin de
                saisie manuelle fastidieuse.
              </p>

              <dl className="mt-10 space-y-10">
                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-lg bg-gold-soft text-gold-dark">
                      <FileText className="h-6 w-6" aria-hidden />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-semibold text-ink">
                      Import PDF & OCR
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-ink-soft">
                    Transformez vos cartes statiques en base de données produits
                    exploitable en quelques secondes.
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-10 -mx-4 relative lg:mt-0">
              <div className="bg-surface rounded-xl shadow-xl overflow-hidden ring-1 ring-line mx-4">
                <ClickableImage
                  src="/pdfToProduct.png"
                  alt="Importation de fichier et génération automatique de produits"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          <div className="relative mt-12 sm:mt-16 lg:mt-24">
            <div className="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div className="lg:col-start-2">
                <h3 className="font-display text-2xl font-bold text-ink tracking-tight sm:text-3xl">
                  Suivi de Production Précis
                </h3>
                <p className="mt-3 text-lg text-ink-soft leading-relaxed">
                  Générez automatiquement les listes de production pour votre
                  cuisine. Sachez exactement quoi préparer, jour par jour ou sur
                  une période donnée.
                </p>

                <dl className="mt-10 space-y-10">
                  <div className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-lg bg-olive-soft text-olive-dark">
                        <ClipboardList className="h-6 w-6" aria-hidden />
                      </div>
                      <p className="ml-16 text-lg leading-6 font-semibold text-ink">
                        Listes consolidées
                      </p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-ink-soft">
                      Visualisez les quantités totales par produit pour éviter
                      le gaspillage et les oublis.
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-10 -mx-4 relative lg:mt-0 lg:col-start-1">
                <div className="bg-surface rounded-xl shadow-xl overflow-hidden ring-1 ring-line mx-4">
                  <ClickableImage
                    src="/productionDashboard.png"
                    alt="Tableau de suivi de production journalier"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
              Collaboration simplifiée
            </h2>
            <p className="mt-4 text-lg text-ink-soft">
              Invitez votre équipe et gérez les rôles facilement.
            </p>
          </div>
          <div className="mt-12 grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className="bg-surface rounded-xl border border-line p-8 text-center hover:shadow-md hover:border-gold/50 transition-all duration-200">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gold-soft text-gold-dark mb-4">
                <Users className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-ink">
                Gestion d&apos;équipe
              </h3>
              <p className="mt-2 text-base text-ink-soft">
                Invitez des membres par email et assignez des rôles (Admin ou
                Membre) en un clic.
              </p>
            </div>
            <div className="bg-surface rounded-xl border border-line p-8 text-center hover:shadow-md hover:border-gold/50 transition-all duration-200">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-olive-soft text-olive-dark mb-4">
                <CheckCircle2 className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-ink">
                Prise de commande
              </h3>
              <p className="mt-2 text-base text-ink-soft">
                Interface dédiée pour la prise de commande rapide par vos
                équipes de vente.
              </p>
            </div>
            <div className="bg-surface rounded-xl border border-line p-8 text-center hover:shadow-md hover:border-gold/50 transition-all duration-200">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-parchment text-primary mb-4">
                <LayoutDashboard className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-ink">
                Vue d&apos;ensemble
              </h3>
              <p className="mt-2 text-base text-ink-soft">
                Suivez toutes les commandes à venir et passées depuis un tableau
                de bord centralisé.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-gold-soft mb-6">
            <Sparkles className="h-4 w-4" aria-hidden />
            Essai gratuit
          </span>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Prêt à optimiser votre activité ?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gold-soft/90">
            Rejoignez les entrepreneurs qui gagnent du temps chaque jour avec
            Cahier du Chef.
          </p>
          <Link
            href={userId ? "/admin" : "/inscription"}
            className="mt-8 w-full inline-flex items-center justify-center h-12 px-6 rounded-lg text-base font-semibold text-primary bg-white hover:bg-gold-soft sm:w-auto transition-colors"
          >
            {userId ? "Accéder à l'application" : "Créer mon compte gratuitement"}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-cream border-t border-line">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-6 justify-between items-center">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Cahier du Chef Logo"
                width={24}
                height={24}
                className="h-6 w-6 opacity-70"
              />
              <span className="ml-2 font-display font-semibold text-ink-soft">
                Cahier du Chef
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/a-propos"
                className="text-ink-soft hover:text-ink transition-colors"
                title="À propos"
              >
                À propos
              </Link>
              <p className="text-center text-sm text-ink-soft/70">
                &copy; 2026 Cahier du Chef. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
