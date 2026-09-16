---
status: accepted
date: 2026-08-31
---

# Compte unique par tenant, accès admin par code PIN

Chaque tenant a aujourd'hui deux comptes Clerk distincts créés à l'inscription
(`api/public/create-organization`) : un compte `org:admin` et un compte
`org:member`, avec deux emails, deux mots de passe, et une autorisation API
qui repose sur `orgRole` (`admin/layout.tsx`, `proxy.ts`,
`PUT`/`DELETE /api/orders*`). En usage réel, l'app tourne sur une tablette
partagée par l'équipe du traiteur : la séparation en deux identités Clerk ne
reflète pas deux personnes qui se connectent chacune sur leur propre appareil,
mais un seul poste que plusieurs personnes utilisent à tour de rôle pour
prendre des commandes. Nous remplaçons ce modèle par **un compte Clerk unique
par tenant** ; l'accès au panneau admin est déverrouillé par un **code PIN**
saisi au moment d'y entrer, plutôt que par une seconde identité.

## Décisions associées

- **Un seul compte Clerk par tenant**, créé `org:admin` à l'inscription. Plus
  de compte "membre" séparé : `TenantMember`/`TenantRole` (schema.prisma),
  `api/members/route.ts` (invitations, cap de 4), la page
  `/accept-invitation` et la section "inviter un membre" de `admin/page.tsx`
  disparaissent — il n'y a plus de second rôle Clerk à gérer. Le champ
  `role` exposé par `AppContext` (dérivé de `useOrganization()`) disparaît
  avec elles : plus aucune UI ne branche sur un rôle Clerk.
- **Le PIN est une vraie barrière serveur**, pas un gate cosmétique côté
  client : hashé sur `Tenant` (`pinCodeHash`), vérifié par un endpoint dédié,
  avec rate-limit/verrouillage temporaire après une série d'échecs pour
  encaisser le bruteforce sur un PIN court.
- **Aucune session admin persistante entre deux visites** : le PIN est
  redemandé à chaque entrée dans l'espace admin (choix délibéré, pas de
  timeout côté serveur qui laisserait une fenêtre ouverte si la tablette
  change de mains sans qu'on quitte explicitement l'admin).
- **L'écran par défaut après connexion est l'écran de prise de commande**
  (`/user` et `/commandes`, accessibles à tout le monde sans PIN — la
  distinction "réservé aux non-admins" disparaît, ces routes deviennent
  simplement l'expérience par défaut). `/commandes` devient **purement en
  lecture** : les boutons Modifier/Supprimer (désactivés pour les non-admins
  aujourd'hui, cf. ADR 0001) sont retirés plutôt que de leur trouver un
  nouveau rôle — l'édition est centralisée dans `/admin`.
- **Le catalogue hérite du même contrôle.** `api/catalog/route.ts`
  (`POST`/`PUT`/`DELETE`) n'a aujourd'hui *aucune* vérification de rôle côté
  serveur — seule la navigation vers `/admin` protégeait ces routes en
  pratique. Avec un compte unique qui a de facto tous les droits Clerk, cette
  absence de contrôle devient une vraie brèche si elle n'est pas comblée par
  le même gate PIN que les commandes.
- **L'édition d'une commande existante déménage dans `/admin`.** Aujourd'hui,
  cliquer "Modifier" dans `OrdersManager` (même depuis l'onglet commandes de
  l'admin) navigue vers `/user?orderId=…`, hors de toute zone protégée. Avec
  `/user` désormais libre d'accès, ce point d'entrée serait un trou dans le
  gating PIN. Le formulaire d'édition est donc déplacé pour être monté depuis
  `/admin` plutôt que via une navigation vers `/user` — la frontière reste
  nette : `/admin` = PIN, tout le reste = libre, sans exception.
- **Tenants existants : nettoyage, pas migration.** L'app n'est pas encore
  ouverte au public ; les ~5-6 tenants en base sont des données factices.
  Pas de script de migration prudent ni de communication client à prévoir —
  un script de nettoyage supprime purement et simplement ces tenants (Clerk
  + DB) avant le déploiement de ce changement.

## Ce que ça remplace

Cette décision annule l'évolution "élévation ponctuelle par code PIN" décrite
dans les conséquences de l'ADR 0001 (déblocage ciblé d'une seule action
depuis un bouton désactivé, comptes séparés conservés) et l'item TODO
correspondant. Elle rend aussi caduque la piste "faire passer le membre par
une invitation Clerk pour qu'il ait son propre mot de passe" : sans compte
membre, la dette assumée sur les deux mots de passe saisis à l'inscription
disparaît d'elle-même plutôt que d'être corrigée.

## Détails techniques actés

- **Format du PIN** : 6 chiffres numériques. Compromis entre saisie rapide au
  pavé tactile et résistance au bruteforce (1M de combinaisons) une fois
  combiné au rate-limit ci-dessous.
- **Hash** : `crypto.scrypt` natif Node (pas de nouvelle dépendance type
  bcrypt/argon2), stocké `salt:hash` en hex sur `Tenant.pinCodeHash`,
  comparaison via `crypto.timingSafeEqual`.
- **Rate-limit progressif** : verrouillage après 5 échecs consécutifs, durée
  qui double à chaque nouvelle série d'échecs (1 min → 2 → 4 → … plafonné à
  15 min), compteur et horodatage sur `Tenant` (`pinFailedAttempts`,
  `pinLockedUntil`), remis à zéro dès qu'un PIN correct est saisi.
- **Alerte mail sur verrouillage** : un mail est envoyé à l'admin (Resend,
  même pattern que `WelcomeEmail`, nouveau composant `PinLockoutEmail`) une
  fois par épisode de verrouillage — pas à chaque échec individuel. Contenu
  minimal : nom de l'organisation, horodatage, durée du verrouillage, et
  l'adresse IP brute de la requête (`x-forwarded-for`, lue au moment du
  verrouillage, jamais persistée en base). Envoi fire-and-forget, fallback
  `console.log` si `RESEND_API_KEY` absent. La géolocalisation de l'IP est
  explicitement hors scope (dépendance externe + implications RGPD à traiter
  à part) — post-MVP.
- **Session admin** : cookie httpOnly, signé (HMAC, secret dédié),
  `Secure` en prod, `SameSite=Lax`, posé par l'endpoint de vérification PIN.
  Sortie explicite via une action "Quitter l'admin" qui supprime le cookie ;
  filet de sécurité avec une durée de vie courte (15 min) au cas où la
  tablette est abandonnée sans clic explicite.
- **PIN défini à l'inscription**, dans le même formulaire que le mot de passe
  admin (pas d'écran séparé au premier login — évite de reproduire les bugs
  déjà rencontrés avec les flows Clerk `pending`, cf. `TODO.md`).
- **PIN oublié** : lien "PIN oublié ?" sur l'écran de saisie → mail (Resend)
  avec un lien de réinitialisation à usage unique et courte durée de vie
  (token signé, même mécanisme que le cookie de session) → écran de
  définition d'un nouveau PIN.
- **Tests** : Vitest + React Testing Library + MSW (préférence affirmée,
  plutôt que `bun test` natif malgré Bun comme package manager — MSW mocke
  la frontière HTTP/`fetch`, utile pour les appels Clerk SDK/Resend dans
  `create-organization` par ex.). Prisma est mocké pour les tests unitaires
  de logique pure (hash/vérif PIN, calcul du backoff, signature du cookie).
  Pour les routes API qui touchent réellement la DB (scoping tenant sur
  `orders`/`catalog` — l'invariant que `TODO.md` identifie comme le plus
  critique à tester), un **Postgres local via Docker Compose** (migré via
  `prisma migrate deploy`) sert de vraie base d'intégration, plutôt que de
  mocker Prisma ou de dépendre d'une branche Neon réseau. Sert aussi de base
  de dev locale au quotidien.

## Limitation assumée

Avec Prisma mocké pour la majorité des tests, l'invariant de scoping tenant
n'est garanti que si les tests asserent explicitement sur les arguments
passés à Prisma (`where: { tenantId: orgId, … }`) — un mock qui ignore les
arguments et renvoie une valeur fixe ne détecterait pas un `where` cassé.
Cette discipline doit être maintenue dans les tests API mockés ; les tests
d'intégration Docker Postgres restent le filet de sécurité réel pour ce cas
précis.
