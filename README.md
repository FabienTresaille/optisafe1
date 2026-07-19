# Optisafe.fr

> SaaS de comparaison de contrats d'assurance avec détection de doublons inter-contrats et fiche d'urgence intelligente.

## 🚀 Déploiement sur le VPS

### Prérequis

- Docker & Docker Compose installés
- Traefik v3.1 en fonctionnement sur le réseau `audit-app_web`
- Le sous-domaine `optisafe.alsek.fr` (ou `optisafe.fr`) pointant vers le VPS

### Étapes

1. **Cloner le dépôt** sur le VPS :
   ```bash
   git clone <url-du-repo> /opt/optisafe
   cd /opt/optisafe
   ```

2. **Configurer les variables d'environnement** :
   ```bash
   cp .env.example .env
   nano .env   # Renseigner les vraies valeurs (DB, JWT_SECRET, GEMINI_API_KEY)
   ```

3. **Lancer l'application** :
   ```bash
   docker compose up -d --build
   ```

4. **Initialiser la base de données** (première fois uniquement) :
   ```bash
   docker compose exec app npx prisma migrate deploy
   ```

5. **Vérifier** :
   - L'application doit être accessible sur `https://optisafe.alsek.fr`
   - Vérifier les logs : `docker compose logs -f app`

### Mise à jour

```bash
cd /opt/optisafe
git pull
docker compose up -d --build
docker compose exec app npx prisma migrate deploy  # si des migrations ont été ajoutées
```

### Sauvegardes

#### Base de données
```bash
docker compose exec db pg_dump -U optisafe optisafe > backup_$(date +%Y%m%d).sql
```

#### Fichiers contrats
```bash
# Les fichiers sont dans le volume Docker "contracts"
docker run --rm -v optisafe_contracts:/data -v $(pwd)/backups:/backup alpine tar czf /backup/contracts_$(date +%Y%m%d).tar.gz /data
```

### Passage en production (`optisafe.fr`)

1. Modifier le DNS pour pointer `optisafe.fr` vers le VPS
2. Mettre à jour `.env` :
   ```
   APP_DOMAIN=optisafe.fr
   NEXT_PUBLIC_APP_URL=https://optisafe.fr
   ```
3. Redéployer : `docker compose up -d --build`

---

## 🛠️ Développement local

```bash
npm install
cp .env.example .env  # Configurer pour le dev local
npx prisma generate
npx prisma migrate dev
npm run dev
```

## 📁 Structure du projet

```
├── docker-compose.yml      # Services Docker (app, worker, db, redis)
├── Dockerfile              # Build multi-stage
├── prisma/schema.prisma    # Schéma base de données
├── src/
│   ├── app/                # Pages Next.js (App Router)
│   │   ├── (auth)/         # Login, Register
│   │   ├── (app)/          # Dashboard, Contrats, Comparaison, Doublons, Urgence, IA
│   │   └── api/            # API routes
│   ├── components/         # Composants React
│   │   ├── ui/             # Design system (Button, Card, Badge, Input, Modal…)
│   │   └── domain/         # Composants métier
│   ├── lib/                # Logique partagée
│   │   ├── taxonomy/       # Référentiel de garanties (5 familles, tags transversaux)
│   │   ├── services/       # Services métier (comparaison, doublons, extraction…)
│   │   ├── auth/           # Authentification JWT
│   │   └── db/             # Client Prisma
│   └── worker/             # Worker BullMQ (extraction IA asynchrone)
└── docs/                   # Documentation projet
```

## 🔑 Variables d'environnement

Voir [.env.example](.env.example) pour la liste complète.
