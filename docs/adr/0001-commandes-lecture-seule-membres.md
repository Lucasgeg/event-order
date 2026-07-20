---
status: accepted
date: 2026-07-18
---

# Commandes en lecture seule pour les membres, sans ouvrir /admin

Les membres non-admins doivent consulter les commandes (à venir et passées),
jusqu'ici uniquement visibles dans `/admin`, verrouillé par le middleware sur
`org:admin`. Nous avons créé une page partagée `/commandes` accessible à tout
membre de l'organisation (composant `OrdersManager` extrait et réutilisé par
l'onglet admin), plutôt que d'ouvrir `/admin` avec un gating par onglet : la
barrière « `/admin` = admins uniquement » reste binaire et auditable en trois
lignes de middleware, au lieu de devenir une matrice de permissions par onglet.

## Décisions associées

- **La règle vit côté serveur** : `PUT` et `DELETE` sur `/api/orders*` exigent
  `orgRole === "org:admin"` (403 sinon). Le `POST` reste ouvert aux membres —
  prendre des commandes est leur métier. Les boutons Modifier/Supprimer
  désactivés dans l'IHM ne sont que le reflet de cette règle, jamais la règle
  elle-même.
- **Boutons visibles mais désactivés** (pas masqués) : l'action existe et sera
  déblocable ; le membre sait qu'elle est réservée aux administrateurs.
- **Garde d'entrée** : `/user?orderId=` redirige les non-admins vers
  `/commandes` pour qu'aucun chemin ne mène à un formulaire insoumissible.

## Conséquences

L'évolution prévue — élévation ponctuelle par code PIN admin sur la tablette
du membre (voir `TODO.md`) — s'appuiera sur cette barrière serveur : le PIN
sera validé côté serveur et accordera un droit court et ciblé ; les boutons
désactivés deviendront le point d'entrée de ce flux. Une API ouverte aurait
rendu cette élévation décorative.
