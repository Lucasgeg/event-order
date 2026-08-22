# Soucis à régler

> Uniquement les tâches ouvertes. Les décisions architecturales et leurs
> limitations assumées vivent dans `docs/adr/` ; l'historique des corrections
> est dans git.

## Qualité / dette

### `createRouteMatcher` déprécié côté Clerk

Depuis la mise à jour vers `@clerk/nextjs@7.8.0`, `bun run dev` affiche :
`"createRouteMatcher" is deprecated and will be removed in the next major
release. Use resource-based auth checks instead.` — Clerk recommande de
déplacer les vérifications d'auth dans chaque page/layout/route plutôt que
dans `proxy.ts` (matching par chemin, qui peut diverger du routing réel de
Next.js). Pas urgent (fonctionne encore), mais `proxy.ts` (routes `/admin`,
`/user`, `/commandes`) et ce pattern devront être migrés avant le prochain
major de Clerk. Guide : https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrate-from-create-route-matcher

### Retours d'erreur invisibles pour l'utilisateur

`app/context/AppContext.tsx` : les échecs d'appels API (`addOrder`,
`updateOrder`, actions catalogue) ne font qu'un `console.error` — l'utilisateur
ne voit rien. La page commande utilise aussi des `alert()` bruts
(`app/(authenticated)/user/page.tsx`). Prévoir un retour visuel cohérent
(toast/bandeau avec les tokens du design system). Devenu plus important depuis
que l'API renvoie des 403 aux membres sur l'édition de commandes.

### ESLint : erreurs hors code applicatif

`bun run lint` échoue à cause des scripts `.claude/skills/**/*.cjs`
(`no-require-imports`). Le code applicatif n'a que des warnings. Ajouter
`.claude/` aux ignores du flat config `eslint.config.mjs` pour que le lint
redevienne un signal fiable.

### Petits nettoyages

- `loadingOrder` assigné mais jamais utilisé dans
  `app/(authenticated)/user/page.tsx` (aucun état de chargement affiché
  pendant le fetch d'une commande à éditer).
- Directive `eslint-disable @typescript-eslint/no-explicit-any` devenue
  inutile en tête de ce même fichier.
- Prisma 7.2.0 → 7.8.0 disponible (mise à jour mineure à planifier).

### Vérification si l'email du membre correspond à un compte existant

`api/public/create-organization` vérifie que `adminEmail` et `memberEmail`
sont différents, mais ne vérifie pas si l'email du **membre** correspond déjà
à un compte Clerk existant avant d'appeler `client.users.createUser(...)`
(contrairement à l'admin, dont la création échoue proprement en premier, sans
rien avoir créé). Si le membre a déjà un compte, l'erreur survient dans le
bloc qui déclenche le rollback (organisation + admin supprimés) : pas de
données orphelines, mais l'admin fraîchement créé saute aussi et
l'inscription entière échoue avec un message Clerk brut, sans cause claire
pour l'utilisateur. À vérifier explicitement en amont (comme pour
`adminEmail`) et décider du comportement voulu si le membre a déjà un compte
ailleurs.

### Pas de suite de tests

Aucun test automatisé. Les invariants qui le mériteraient en premier :
scoping tenant des routes API, rôle admin requis sur PUT/DELETE des commandes,
et figeage du prix/nom (`unitPrice`, `designation`) à la création et à
l'édition d'une commande.

## Évolutions prévues

- **Inscription : l'admin choisit les deux mots de passe (dette assumée)** :
  `api/public/create-organization` faisait générer un mot de passe aléatoire
  par compte et le marquait compromis (`setPasswordCompromised`) pour forcer
  un changement au premier login — mécanisme qui s'est révélé bugué (double
  changement de mot de passe requis, sessions Clerk `pending` mal
  synchronisées côté client, cf. historique git autour de
  `app/session-tasks/reset-password/page.tsx`). Choix fait pour le MVP :
  l'administrateur saisit lui-même le mot de passe du compte admin **et**
  celui du compte membre dans le formulaire d'inscription ; plus de mot de
  passe généré, plus de flag compromis, plus de reset forcé. L'exposition
  (l'admin connaît en permanence le mot de passe du membre) est assumée
  volontairement, à revoir après le MVP. Piste retenue pour la suite : garder
  la saisie directe pour l'admin (fondateur de l'organisation, pas de
  mécanisme Clerk permettant d'inviter quelqu'un à créer une organisation qui
  n'existe pas encore), mais faire passer le **membre** par une invitation
  Clerk (`client.organizations.createOrganizationInvitation` +
  `/accept-invitation`, déjà utilisé pour inviter des membres depuis
  l'admin) — il définirait alors son propre mot de passe, sans que
  personne d'autre ne le connaisse.

- **Élévation par code PIN admin** : débloquer ponctuellement l'édition d'une
  commande sur la tablette d'un membre. Les contraintes de conception sont
  actées dans `docs/adr/0001-commandes-lecture-seule-membres.md` (validation
  serveur, élévation courte et ciblée, les boutons désactivés deviennent le
  point d'entrée du flux).
- **Confirmation avant suppression d'un produit** : le clic sur "Supprimer"
  (`app/(authenticated)/admin/page.tsx`) déclenche l'action immédiatement, sans
  `confirm()` ni modale — à faire une fois le système de toast en place (item
  "Retours d'erreur invisibles" ci-dessus), pour remplacer proprement les
  `alert()` de retour par la même occasion.
