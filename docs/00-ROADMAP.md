# Optisafe.fr — Roadmap de développement

## Identité
- **Nom du projet** : Optisafe.fr
- **Sous-domaine de test** : `optisafe.alsek.fr`
- **Domaine final** : `optisafe.fr` (bascule après validation)

## Vision
Outil SaaS permettant à un utilisateur de :
1. Comparer ses contrats d'assurance (par import de document OU en indiquant l'offre présente sur le site de l'assureur)
2. Générer une fiche "en cas d'urgence" listant les cas d'usage principaux, avec fallback IA qui va chercher la réponse directement dans les contrats si le cas n'est pas déjà couvert

## Hébergement
- VPS OVH existant (Debian 12, Docker, Traefik v3.1 en place)
- Nouveau service Docker rejoignant le réseau externe `audit-app_web`
- SSL via resolver `letsencrypt` déjà configuré, entrypoint `websecure` (443)

## Développement & déploiement
- Codage de l'application en local par **Antigravity**
- Poussée du code vers le VPS via **GitHub Desktop** (repo Git → déploiement sur le VPS)

## Fichiers de suivi par fonctionnalité
- [ ] `01-infrastructure-docker-traefik.md`
- [ ] `02-import-comparaison-contrats.md`
- [ ] `03-fiche-urgence.md`
- [ ] `04-recherche-ia-contrats.md`
- [ ] `05-suivi-projet.md`
- [x] `06-charte-graphique-ui-ux.md` (validée)

## Grandes étapes (macro)
- [ ] Définir le stack technique (backend, frontend, DB, stockage fichiers, moteur IA)
- [ ] Poser l'infrastructure Docker/Traefik (staging)
- [ ] MVP : import de contrat (PDF) + extraction des infos clés
- [ ] MVP : saisie manuelle d'une offre (formulaire structuré)
- [ ] Moteur de comparaison entre contrats/offres
- [ ] Génération de la fiche "en cas d'urgence" (cas d'usage prédéfinis)
- [ ] Intégration IA : recherche dans les contrats quand le cas d'usage n'est pas prévu
- [ ] Tests utilisateurs internes
- [ ] Mise en production sur le VPS
- [ ] Suivi post-lancement (bugs, retours, itérations)

## Notes
Ce dossier de fichiers `.md` sert de tableau de bord texte du développement : chaque fichier détaille une fonctionnalité et peut être mis à jour au fil de l'avancement (cases à cocher, décisions techniques, blocages).
