-- Ajoute la désignation figée sur OrderItem.
-- Backfill : les lignes existantes prennent le nom actuel du produit
-- (le nom historique n'a jamais été stocké, c'est la meilleure valeur disponible).
ALTER TABLE "OrderItem" ADD COLUMN "designation" TEXT;

UPDATE "OrderItem"
SET "designation" = p."designation"
FROM "Product" p
WHERE "OrderItem"."productId" = p."id";

ALTER TABLE "OrderItem" ALTER COLUMN "designation" SET NOT NULL;
