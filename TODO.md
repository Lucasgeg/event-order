# Soucis à régler

> Uniquement les tâches ouvertes. Les décisions architecturales et leurs
> limitations assumées vivent dans `docs/adr/` ; l'historique des corrections
> est dans git.

## Qualité / dette

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

### Suite de tests encore partielle

Vitest + RTL + MSW en place (`vitest.config.mts` unitaire, Prisma mocké ;
`vitest.integration.config.mts` avec un vrai Postgres via `docker-compose.yml`),
avec une première couverture sur le PIN admin (`lib/pin.ts`,
`lib/adminSession.ts`, `api/admin-session`, scoping tenant sur
`api/orders`). Reste sans test : le figeage du prix/nom (`unitPrice`,
`designation`) à la création/édition d'une commande, et `api/catalog`
(scoping tenant + le nouveau gate PIN).

## Évolutions prévues

- **Confirmation avant suppression d'un produit** : le clic sur "Supprimer"
  (`app/(authenticated)/admin/page.tsx`) déclenche l'action immédiatement, sans
  `confirm()` ni modale — à faire une fois le système de toast en place (item
  "Retours d'erreur invisibles" ci-dessus), pour remplacer proprement les
  `alert()` de retour par la même occasion.
