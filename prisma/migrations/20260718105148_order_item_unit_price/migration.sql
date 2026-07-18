-- Ajoute le prix unitaire figé sur OrderItem.
-- Backfill : les lignes existantes prennent le prix actuel du produit
-- (le prix historique n'a jamais été stocké, c'est la meilleure valeur disponible).
ALTER TABLE "OrderItem" ADD COLUMN "unitPrice" DOUBLE PRECISION;

UPDATE "OrderItem"
SET "unitPrice" = p."price"
FROM "Product" p
WHERE "OrderItem"."productId" = p."id";

ALTER TABLE "OrderItem" ALTER COLUMN "unitPrice" SET NOT NULL;
