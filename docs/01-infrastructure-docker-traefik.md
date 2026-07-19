# 01 — Infrastructure (Docker + Traefik)

## Objectif
Déployer le SaaS comme un nouveau service Docker derrière le Traefik v3.1 déjà en place sur le VPS OVH.

## Paramètres réseau confirmés
- **Réseau Docker externe** : `audit-app_web` (obligatoire pour que Traefik route vers le service — le service doit rejoindre ce réseau en `external: true`)
- **Certificat SSL** : resolver `letsencrypt` (déjà configuré sur le VPS, ne pas recréer)
- **Entrypoint** : `websecure` (port 443)
- **Traefik version** : v3.1 (attention à la syntaxe des labels, différente de v2 sur certains points)

## Workflow de développement / déploiement
- Développement de l'application en local par Antigravity
- Poussée du code vers le VPS via **GitHub Desktop** (dépôt Git → pull/déploiement sur le VPS)
- Donc : prévoir un repo Git propre dès le départ (`.gitignore` incluant `.env`, `node_modules`, fichiers de contrats uploadés, etc.)

## À faire
- [ ] Créer le repo Git du projet (structure claire : `/app`, `/docker-compose.yml`, `/.env.example`)
- [ ] Créer le `docker-compose.yml` du service (app + DB + éventuel worker IA)
- [ ] Rejoindre le réseau Traefik existant : 
  ```yaml
  networks:
    audit-app_web:
      external: true
  ```
- [ ] Ajouter les labels Traefik v3.1 (exemple à adapter) :
  ```yaml
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.saas-assurance.rule=Host(`optisafe.alsek.fr`)"
    - "traefik.http.routers.saas-assurance.entrypoints=websecure"
    - "traefik.http.routers.saas-assurance.tls.certresolver=letsencrypt"
    - "traefik.http.services.saas-assurance.loadbalancer.server.port=<port_interne_app>"
  ```
- [x] Sous-domaine défini : `optisafe.alsek.fr` (phase de test), migration ensuite vers `optisafe.fr` en prod
- [ ] Choisir le stockage des fichiers contrats (volume Docker local vs bucket S3-compatible OVH)
- [ ] Mettre en place une base de données (Postgres conseillé pour données structurées + relations utilisateur/contrats)
- [ ] Variables d'environnement / secrets (clé API IA, DB, etc.) — via `.env` non versionné, `.env.example` versionné
- [ ] Process de déploiement documenté : pull du repo sur le VPS + `docker compose up -d --build`
- [ ] Sauvegardes (DB + fichiers contrats)
- [ ] Environnement de staging avant mise en prod (déjà couvert par `optisafe.alsek.fr`, qui sert de test avant bascule sur `optisafe.fr`)
- [ ] Prévoir la migration DNS + label Traefik vers `optisafe.fr` lors du passage en prod

## Décisions techniques
- (à compléter au fur et à mesure)

## Blocages / points de vigilance
- Bien vérifier que le service rejoint le réseau `audit-app_web` et pas un réseau créé par défaut par Docker Compose
- Ne pas dupliquer/reconfigurer le certresolver `letsencrypt`, il est déjà géré par le conteneur Traefik existant
