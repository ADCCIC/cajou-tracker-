# Cajou Tracker - Côte d'Ivoire

Application web de suivi des exports et prix de noix de cajou (RCN) et amandes (Kernels) depuis la Côte d'Ivoire.

## Fonctionnalités

### Module Exports
- Dashboard avec volumes et valeurs RCN/Kernels
- Graphiques temporels (évolution 2015-présent)
- Top destinations avec analyse
- Comparaison pays producteurs (CI, Vietnam, Inde, Nigeria, Ghana)

### Module Prix
- Prix du jour (RCN et Kernels, FOB et bord-champ)
- Historique avec graphiques
- Alertes configurables (seuils, variations %)
- **Calculateur FOB/CIF** avec:
  - Calcul DUS (5% RCN, 0% Kernels)
  - Coûts transport et manutention
  - Fret et assurance par destination

### Module Données
- Import CSV/Excel
- Saisie manuelle
- Audit trail des uploads

## Sources de Données

| Source | Données | API |
|--------|---------|-----|
| FAOSTAT | Production | http://fenixservices.fao.org/faostat/api |
| UN Comtrade | Commerce | https://comtradeapi.un.org |
| Commodities-API | Prix temps réel | https://commodities-api.com |

### Codes HS
- `0801.31` - RCN (noix brutes en coque)
- `0801.32` - Kernels (amandes décortiquées)

## Stack Technique

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **UI**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **Validation**: Zod + React Hook Form

## Installation

```bash
# Cloner le repo
git clone <repo-url>
cd cajou-tracker

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Générer le client Prisma
npx prisma generate

# Lancer en développement
npm run dev
```

## Variables d'Environnement

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
COMTRADE_API_KEY=""      # Optionnel
COMMODITIES_API_KEY=""   # Optionnel
CRON_SECRET=""           # Pour les jobs Vercel
```

## Déploiement (Vercel)

1. Connecter le repo à Vercel
2. Configurer les variables d'environnement
3. Déployer

Les cron jobs sont configurés dans `vercel.json`:
- Sync quotidien à 2h: `/api/cron/sync-daily`
- Vérification alertes toutes les 6h: `/api/cron/check-alerts`

## Informations Marché

| Métrique | Valeur |
|----------|--------|
| Production CI 2024 | ~1.5M tonnes RCN |
| Taux transformation | 36% (objectif 44% en 2030) |
| Conversion RCN→Kernels | 1t RCN ≈ 200-220 kg amandes |
| DUS | 5% RCN, 0% Kernels (depuis nov. 2024) |

## Scripts

```bash
npm run dev       # Démarrage local
npm run build     # Build production
npm run start     # Démarrer en production
npm run lint      # Linter
```

## Structure du Projet

```
cajou-tracker/
├── src/
│   ├── app/                 # Routes Next.js App Router
│   │   ├── (dashboard)/     # Pages dashboard
│   │   │   ├── exports/     # Module exports
│   │   │   ├── prices/      # Module prix
│   │   │   └── data/        # Gestion données
│   │   └── api/             # Routes API
│   │       ├── external/    # Proxy APIs externes
│   │       ├── prices/      # CRUD prix
│   │       ├── exports/     # CRUD exports
│   │       └── cron/        # Jobs planifiés
│   ├── components/          # Composants React
│   │   ├── ui/              # shadcn/ui
│   │   ├── charts/          # Graphiques Recharts
│   │   └── dashboard/       # Composants dashboard
│   ├── lib/                 # Utilitaires
│   │   ├── api/             # Clients APIs externes
│   │   ├── db/              # Client Prisma
│   │   └── utils/           # Calculs, conversions
│   └── types/               # Types TypeScript
├── prisma/
│   └── schema.prisma        # Modèles de données
└── vercel.json              # Config Vercel + Cron
```

## License

MIT
