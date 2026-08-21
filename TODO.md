# Soucis à régler

> Uniquement les tâches ouvertes. Les décisions architecturales et leurs
> limitations assumées vivent dans `docs/adr/` ; l'historique des corrections
> est dans git.

## Bugs

### Connexion cassée après mise à jour Clerk : statut `needs_client_trust` non géré

- **Contexte** : mise à jour de l'instance Clerk pour la "Reset password
  session task" (voir item ci-dessous). Clerk avertit que le nouveau statut
  de sign-in `needs_client_trust` doit être géré côté custom flow.
- **Symptôme attendu après la mise à jour** : `app/login/page.tsx` —
  `handleSignIn` (ligne ~57) et `handleResetPassword` (ligne ~165) ne testent
  que `result.status === "complete"` et `"needs_second_factor"` ; tout le
  reste tombe dans un `else { console.log(...) }` muet. `needs_client_trust`
  se déclenche quand le mot de passe est correct, que le MFA n'est pas activé
  et que la connexion vient d'un nouvel appareil — donc systématiquement à la
  toute première connexion de chaque compte fraîchement provisionné par
  `create-organization`. Sans fix, la première connexion de tout nouvel
  utilisateur reste bloquée silencieusement (pas d'erreur, juste le bouton qui
  s'arrête de charger).
- **Vérifié** : rien dans le code ne référence `client_trust_state`, donc
  l'autre partie de l'avertissement Clerk ne nous concerne pas.
- **Débloqué** : `@clerk/nextjs` mis à jour `6.36.5` → `7.8.0` (voir commit
  dédié). Le type `SignInStatus` inclut maintenant `needs_client_trust`
  (`node_modules/@clerk/shared/dist/types/signInCommon.d.ts`). L'upgrade a été
  faite via `bunx @clerk/upgrade` (codemods officiels) ; les 3 points signalés
  par son scanner ont été vérifiés et ne nous concernent pas (0 usage de
  Device Trust existant, `auth.protect()` 401-vs-404 ne s'applique qu'aux
  Server Actions — absentes du projet —, et les 2 "redirect props" signalées
  étaient des faux positifs : `afterSignOutUrl` sur `ClerkProvider` et
  `redirectUrl` sur `createOrganizationInvitation` restent les bons noms).
  Testé manuellement (`bun run dev`) : `/login`, `/` répondent 200,
  `/user`/`/admin`/`/commandes` redirigent proprement vers `/login` sans
  session — pas de régression sur le fix `/user`+`/commandes` du bug
  précédent malgré l'issue GitHub connue sur `auth.protect()` en v7.
- **Reste à faire** : élargir la condition à
  `result.status === "needs_second_factor" || result.status === "needs_client_trust"`
  aux deux endroits (`handleSignIn` et `handleResetPassword` dans
  `app/login/page.tsx`), même mécanique que `needs_second_factor` (check
  `email_code` dans `supportedSecondFactors`, `prepareSecondFactor`, écran
  `verify-2fa`, `attemptSecondFactor`).

### Le mot de passe temporaire "compromis" n'est jamais vraiment réinitialisé

- **Symptôme** : à l'inscription, `setPasswordCompromised` est appelé sur les
  comptes admin et membre (`app/api/public/create-organization/route.ts`),
  mais rien n'oblige l'utilisateur à changer son mot de passe temporaire à la
  première connexion — il se connecte normalement et atterrit directement sur
  `/admin` ou `/user`.
- **Cause** : Clerk gère ce cas via une *session task* `reset-password`
  attachée à la session (le compte n'a pas d'autre méthode de connexion que
  email + mot de passe). `app/login/page.tsx` doit détecter cette tâche en
  attente (`session?.currentTask?.key === "reset-password"`) et rediriger vers
  un écran de réinitialisation obligatoire avant de laisser passer — ce check
  n'existe que dans `handleResetPassword` (et y est un stub qui ne fait qu'un
  `console.log`), pas du tout dans `handleSignIn`, qui appelle `setActive`
  sans jamais regarder `session?.currentTask`.
- **Reste à faire** :
  1. Vérifier que l'instance Clerk du projet supporte bien la "Reset password
     session task" (fonctionnalité de déc. 2025 sur certaines instances).
  2. Déclarer `taskUrls={{ "reset-password": "/session-tasks/reset-password" }}`
     sur le `<ClerkProvider>`.
  3. Dans `handleSignIn`, passer un callback `navigate` à `setActive` qui
     redirige vers cet écran si `session?.currentTask?.key === "reset-password"`
     au lieu de continuer vers `/admin`/`/user`.
  4. Construire l'écran de réinitialisation forcée (composant `<TaskResetPassword />`
     de Clerk, ou équivalent custom cohérent avec le reste du flow de login).

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

### Pas de confirmation de saisie sur le nouveau mot de passe

Le formulaire de réinitialisation (`app/login/page.tsx`, vue `reset-password`,
champ `newPassword` autour de la ligne 384) n'a qu'un seul champ mot de passe.
Ajouter un second input "confirmer le mot de passe" et bloquer la soumission
tant que les deux ne correspondent pas, pour éviter qu'une faute de frappe
verrouille l'utilisateur hors de son compte.

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

### Pas de suite de tests

Aucun test automatisé. Les invariants qui le mériteraient en premier :
scoping tenant des routes API, rôle admin requis sur PUT/DELETE des commandes,
et figeage du prix/nom (`unitPrice`, `designation`) à la création et à
l'édition d'une commande.

## Évolutions prévues

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
