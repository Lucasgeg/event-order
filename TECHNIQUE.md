# Contribution technique — Cahier du Chef

> Projet **conçu, architecturé et développé seul**, du modèle de données au déploiement.
> Ce document détaille les choix techniques et les points les plus intéressants du code.

---

## 1. Architecture multi-tenant & sécurité

Le cœur du produit est le **cloisonnement des données par client**. Chaque commerce est
une organisation, et **aucune donnée ne doit fuir d'un locataire à un autre**.

**Choix d'architecture clé :** `Tenant.id` **est** l'`orgId` de Clerk — pas de table de
correspondance intermédiaire. L'identité et les organisations sont déléguées à Clerk
(source de vérité), et la base ne stocke que ce qui lui est propre.

```ts
const { orgId } = await auth();
if (!orgId) return 401;
// toute requête est scopée : { tenantId: orgId }
```

Points travaillés :

- **Scoping systématique** de chaque requête Prisma par `tenantId` (invariant de sécurité
  central) : toute lecture/écriture d'une ressource métier (catégories, produits, commandes,
  membres) est filtrée par le locataire courant.
- **Middleware d'autorisation** (`proxy.ts`, renommé depuis `middleware.ts` en Next.js 16) :
  protection des routes `/admin*`, redirection des utilisateurs déjà connectés hors des pages
  de login, gating sur le rôle Clerk `org:admin`.
- **Deux vocabulaires de rôles réconciliés** : rôles Clerk (`org:admin` / `org:member`) qui
  font autorité pour les décisions d'accès, et un miroir DB (`TenantRole`) synchronisé au
  mieux — Clerk reste la référence.
- **Modèle de données** relationnel propre avec cascades (`onDelete: Cascade`) : la suppression
  d'un tenant nettoie catégories, produits, commandes et membres.

**Compétences démontrées :** conception d'un SaaS multi-tenant, modélisation d'un invariant
de sécurité et application disciplinée sur toute la surface d'API, délégation d'identité.

---

## 2. Intégration IA — import d'une carte depuis un PDF ou une photo

Fonctionnalité la plus aboutie techniquement : transformer une **carte existante** (fichier
PDF, image scannée ou texte brut) en **catalogue structuré** inséré en base, sans ressaisie.

Pipeline (`app/api/generate-menu/route.ts`) :

1. **Ingestion** de l'upload (PDF / image / texte).
2. **Découpage des PDF** en tranches de 3 pages avec `pdf-lib` (contrainte de taille de l'OCR).
3. **OCR** via ocr.space pour extraire le texte de chaque page.
4. **Structuration par IA** : appel à **Gemini** (`@google/genai`, modèle configurable via
   `GEMINI_MODEL`) avec un prompt strict imposant un **format JSON** (catégories,
   sous-catégories, produits, prix).
5. **Parsing & validation** de la réponse, puis **insertion en masse** des enregistrements
   pour le tenant courant.

Décision technique notable : **plusieurs migrations de fournisseur LLM** (Perplexity → Groq →
Gemini), au gré des contraintes de coût/disponibilité des modèles — le modèle appelé est
désormais piloté par variable d'env plutôt que codé en dur, pour absorber ce type de
changement sans toucher au code.

**Compétences démontrées :** orchestration d'un pipeline multi-services (OCR → LLM → DB),
prompt engineering avec sortie JSON contrainte, gestion des limites d'API (chunking),
tolérance au changement de fournisseur.

---

## 3. Stack moderne (bleeding edge maîtrisé)

Choix assumé de travailler sur les **dernières versions majeures**, y compris leurs
ruptures d'API :

- **Next.js 16** (App Router) + **React 19** — dont le renommage `middleware.ts → proxy.ts`.
- **Prisma 7** avec **client généré hors de `node_modules`** (`output = "../generated/prisma"`)
  et **driver adapter `PrismaPg`** sur une connexion PostgreSQL — singleton d'instance maison
  dans `lib/prisma.ts`.
- **Bun** comme package manager et runtime (installe, dev, scripts, seed).
- **Tailwind CSS v4** sans `tailwind.config.js` — configuration entièrement dans
  `globals.css` via `@theme`.
- Déploiement **Vercel** avec build custom (`prisma generate && prisma migrate deploy && next build`).

**Compétences démontrées :** veille technologique, capacité à intégrer des outils récents
et à contourner leurs pièges de migration, mise en place d'une chaîne de build/déploiement.

---

## 4. Frontend & design system

- **Store client centralisé** (`AppContext`) : charge le catalogue au montage, expose les
  actions CRUD (POST/PUT/DELETE) puis rafraîchit les données. Le groupe de routes
  `(authenticated)` est enveloppé par ce provider via son layout.
- **API catalogue multiplexée** : une seule route (`api/catalog`) gère
  `category | subCategory | product` via un champ `type`, plutôt que trois endpoints séparés.
- **Design system maison** : tokens de marque dans `@theme` (palette « artisan »),
  bibliothèque de composants réutilisables (`Button`, `Input`, `Card`, `Badge`, `EmptyState`,
  `Segmented`, `Table`…), fonts optimisées via `next/font`.
- **Contrainte d'ergonomie tablette** : cibles tactiles ≥ 44 px, pensées pour l'usage en boutique.

**Compétences démontrées :** architecture front React (state management, composition),
conception d'un design system cohérent, sens du produit et de l'ergonomie métier.

---

## 5. Onboarding & emails transactionnels

Flux d'inscription d'un nouveau commerce (`api/public/create-organization`) entièrement automatisé :

- provisioning de **deux comptes Clerk** (admin + membre) avec **mots de passe générés** ;
- création de l'**organisation Clerk** puis des lignes `Tenant` + `TenantMember` correspondantes ;
- **mots de passe marqués comme compromis** → réinitialisation forcée à la première connexion ;
- **envoi des identifiants par email** via **Resend** + **React Email** (`emails/WelcomeEmail.tsx`),
  avec repli sur un log console si la clé API n'est pas configurée.

Gestion des membres (`api/members`) : invitations via les org invitations de Clerk, avec un
**plafond de 4 membres** par organisation.

**Compétences démontrées :** conception d'un flux d'onboarding sécurisé, intégration
d'un provider d'emails, sens du détail sur la sécurité (reset forcé, fallback dégradé).

---

## Synthèse des compétences

| Catégorie | Éléments |
|---|---|
| **Architecture** | SaaS multi-tenant, invariant de sécurité, délégation d'identité (Clerk) |
| **Backend** | Next.js Route Handlers, Prisma 7 / PostgreSQL, driver adapter, migrations |
| **IA** | Pipeline OCR → LLM (Gemini), prompt engineering JSON, chunking PDF |
| **Frontend** | React 19, App Router, state management, design system, ergonomie tactile |
| **DevOps** | Bun, build/migrations Vercel, gestion d'environnements |
| **Produit** | Traduction d'un besoin réel (boulangère) en produit revendable |

---

*Développé intégralement en solo — de la modélisation du domaine au déploiement.*
