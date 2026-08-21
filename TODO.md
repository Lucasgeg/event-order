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
