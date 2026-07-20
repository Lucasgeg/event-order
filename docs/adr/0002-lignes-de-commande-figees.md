---
status: accepted
date: 2026-07-18
---

# Les lignes de commande figent le prix et le nom du produit

Les lignes de commande (`OrderItem`) référençaient le produit vivant : changer
un prix ou renommer un produit réécrivait silencieusement toutes les commandes
passées. Nous avons choisi de figer `unitPrice` et `designation` sur chaque
ligne au moment de la commande — une commande est un document, comme une ligne
de facture — plutôt que de laisser l'historique suivre le catalogue. Le prix
est toujours calculé côté serveur ; le client n'envoie jamais de montant.

## Décisions associées

- **À l'édition d'une commande**, une ligne renvoyée avec son id d'origine
  garde ses valeurs figées ; une ligne sans id (ajoutée, ou supprimée puis
  recréée) prend les valeurs actuelles du catalogue. Supprimer puis remettre
  un produit est donc le geste volontaire pour passer une ligne au tarif du
  jour.
- **La vue production affiche les noms courants** (agrégation par `productId`),
  pas les noms figés : c'est une vue opérationnelle — ce qu'il y a à préparer —
  pas un document historique. Seuls la liste des commandes et le panier
  affichent les valeurs figées. Ce n'est pas un oubli.
- **Un renommage ou changement de prix ne se propage jamais** aux commandes
  passées, y compris pour corriger une faute de frappe. Si le besoin de
  « corriger partout » apparaît, ce sera une action explicite, pas un effet de
  bord.

## Limitation du backfill

Les migrations `20260718105148_order_item_unit_price` et
`20260718111856_order_item_designation` ont rempli les lignes antérieures avec
les valeurs du catalogue au moment de la migration — l'historique réel n'avait
jamais été stocké. Les commandes d'avant le 2026-07-18 reflètent donc le tarif
et le nom de ce jour-là, pas ceux du jour de la commande. La garantie de
fidélité ne vaut qu'à partir de cette date.
