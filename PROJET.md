# Cahier du Chef — présentation du projet

> SaaS de gestion de catalogue et de commandes pour artisans des métiers de bouche
> (boulangers, traiteurs, restaurateurs). Projet personnel, conçu et développé de A à Z.

## En une phrase

**Cahier du Chef** (marque *« Cet Extra »*) est une application web multi-locataire
qui permet à un commerçant de bouche de gérer son **catalogue** (sa carte, ses produits)
et de saisir les **commandes** de ses clients, avec une vue **production** pour préparer
le travail du jour.

## Origine & problème résolu

Le projet est né d'un besoin concret : une amie **boulangère** qui gérait ses commandes
sur des carnets papier et des tableurs. L'objectif était de lui offrir un outil simple,
utilisable sur **tablette** en boutique, pour :

- centraliser la carte des produits au lieu de la ressaisir sans cesse ;
- enregistrer une commande client (nom, date de retrait, produits, quantités) en quelques secondes ;
- disposer d'une **vue de production** listant ce qu'il y a à préparer pour une date donnée ;
- **importer une carte existante** (PDF, photo ou texte) sans tout retaper à la main.

Le produit est pensé pour être revendu à d'autres artisans : chaque commerce est une
**organisation isolée** qui ne voit que ses propres données.

## Fonctionnalités principales

| Domaine | Ce que ça fait |
|---|---|
| **Catalogue** | Arborescence Catégories → Sous-catégories → Produits (prix, activation/désactivation) |
| **Commandes** | Création d'une commande client avec date de retrait, produits et quantités |
| **Production** | Agrégation des commandes par date pour préparer la journée |
| **Import IA de menu** | Upload d'un PDF/image/texte → OCR → structuration automatique du catalogue par IA |
| **Multi-tenant** | Chaque organisation (commerce) est cloisonnée ; aucune fuite de données entre clients |
| **Rôles** | Administrateur (gère le catalogue, invite des membres) vs utilisateur (saisit les commandes) |
| **Onboarding** | Provisioning automatique des comptes + envoi des identifiants par email |

## Public visé

- **Cible d'usage principale : la tablette en boutique** — interface tactile, cibles ≥ 44 px,
  lisibilité soignée.
- Utilisateurs : artisans des métiers de bouche, non techniciens → l'app doit rester
  évidente et rapide.

## Stack technique (résumé)

- **Frontend / Framework** : Next.js 16 (App Router), React 19, TypeScript
- **Base de données** : PostgreSQL via Prisma 7 (driver adapter `pg`)
- **Authentification & organisations** : Clerk (auth, rôles, invitations, multi-org)
- **IA** : Gemini (`@google/genai`) + OCR (ocr.space) pour l'import de carte
- **Emails transactionnels** : Resend + React Email
- **Style** : Tailwind CSS v4 + design system maison (palette « artisan » dérivée du logo)
- **Outillage** : Bun (package manager & runtime), ESLint, déploiement Vercel

## Identité visuelle

Design system sur-mesure : palette « artisan » (crème, parchemin, brun *primary*, or, olive),
typographies **Playfair Display** (titres) + **Karla** (texte), et une bibliothèque de
composants UI réutilisables. L'ensemble donne une identité chaleureuse et artisanale,
loin d'un back-office générique.

---

*Le détail des choix d'architecture et de la contribution technique est décrit dans
[TECHNIQUE.md](./TECHNIQUE.md).*
