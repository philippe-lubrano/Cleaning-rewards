# Cleaning Rewards 🏠✨

Application web mobile-first pour gérer les tâches ménagères en couple, avec un système de points et de récompenses gamifié.

## Stack Technique

- **Frontend** : React + Vite
- **Styling** : Tailwind CSS
- **Backend** : Supabase (PostgreSQL) — fonctionne aussi en mode local (localStorage) sans configuration Supabase
- **Déploiement** : Vercel / Netlify

## Fonctionnalités

- 👤 **Sélection du profil** — Un seul compte foyer, chaque membre clique sur son prénom
- 📊 **Tableau de bord** — Solde de points, tâches du jour, aperçu du partenaire
- ✅ **Tâches** — Catalogue avec récurrence, validation en un clic pour gagner des points
- ⚙️ **Administration** — Créer, modifier, supprimer des tâches
- 🎁 **Boutique de récompenses** — Chaque personne crée des récompenses pour son partenaire
- 📋 **Historique** — Log complet des tâches accomplies et récompenses réclamées
- 🔔 **Notifications** — Alerte quand le partenaire réclame une récompense

## Démarrage rapide

```bash
npm install
npm run dev
```

L'application fonctionne immédiatement en mode local (localStorage). Pour utiliser Supabase :

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter `supabase/schema.sql` puis `supabase/seed.sql` dans l'éditeur SQL
3. Copier `.env.example` en `.env` et renseigner vos clés :

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
```

## Structure du projet

```
src/
  context/       — Contexte React (état global)
  lib/           — Client Supabase + store localStorage
  pages/         — Pages de l'application
  components/    — Composants réutilisables
supabase/
  schema.sql     — Schéma de base de données
  seed.sql       — Données initiales
```
