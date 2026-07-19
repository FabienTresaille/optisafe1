# Prompt master — Optisafe.fr — SaaS de comparaison de contrats d'assurance

Tu es chargé de développer un SaaS web complet. Voici le contexte, les fonctionnalités attendues et les contraintes techniques à respecter strictement.

## Contexte produit

Le SaaS permet à un utilisateur de :
1. **Comparer ses contrats d'assurance**, via deux voies au choix :
   - **Import** d'un contrat (PDF, éventuellement scan/photo) avec extraction automatique des informations clés (garanties, exclusions, plafonds, franchises, cotisation)
   - **Saisie manuelle** d'une offre présente sur le site d'un assureur, via un formulaire structuré
2. **Détecter les doublons de garanties entre contrats de nature différente** : par exemple, une garantie voyage déjà couverte par une carte bancaire (type Visa Premier) et redondante avec une assurance civile classique (type GMF). L'outil doit rapprocher les garanties au-delà du simple type de contrat et signaler explicitement les doublons à l'utilisateur.
3. **Générer une fiche "en cas d'urgence"** : une fiche synthétique et rapide à consulter, listant les principaux cas d'usage (dégât des eaux, bris de glace, vol, accident, panne, assistance, etc.) avec la marche à suivre et la couverture applicable, construite à partir des contrats renseignés.
4. **Répondre aux cas non prévus par la fiche** : si l'utilisateur pose une question sur un cas d'usage absent de la fiche, le système doit chercher la réponse directement dans le texte du contrat (RAG — retrieval augmented generation) et répondre en citant la clause/section source, sans halluciner. Si l'information n'existe pas dans le contrat, le dire clairement.

## Exigences fonctionnelles détaillées

### Comparaison de contrats
- Un référentiel commun de garanties (taxonomie partagée) doit être défini pour permettre une comparaison cohérente entre contrats de différents assureurs, quelle que soit leur formulation d'origine.
- L'utilisateur doit pouvoir relire/corriger les données extraites automatiquement avant validation.
- Un tableau comparatif doit mettre en évidence les écarts significatifs entre 2+ contrats/offres.

### Détection de doublons inter-contrats
- La taxonomie commune de garanties doit permettre de rapprocher des garanties équivalentes entre des contrats de **nature différente** (pas seulement entre deux offres du même type) : ex. garanties voyage d'une carte bancaire premium vs assurance civile, garantie accident d'un contrat auto vs mutuelle santé.
- Chaque doublon détecté doit être signalé clairement à l'utilisateur, avec le détail des deux garanties concernées, pour l'aider à arbitrer (ex: résilier l'une des deux et réaliser une économie).

### Fiche d'urgence
- Doit rester consultable rapidement, y compris sur mobile, dans un contexte de stress (clarté avant tout).
- Se met à jour automatiquement si un contrat est modifié ou remplacé.
- Exportable/imprimable (PDF).

### Recherche IA dans les contrats
- Indexation du texte des contrats (embeddings / recherche vectorielle ou full-text selon volumétrie).
- Réponses toujours ancrées dans le texte réel du contrat (pas de réponse inventée).
- Citation de la clause ou section utilisée comme source.

## Moteur IA — À RESPECTER IMPÉRATIVEMENT

- Le moteur IA utilisé pour l'extraction des contrats ET pour la recherche/réponse RAG doit être **Gemini** (API Google), car un abonnement **Google AI Pro** est déjà en place.
- Ne propose pas d'autre fournisseur IA (OpenAI, Anthropic, etc.) par défaut — Gemini est un choix arrêté, pas à rediscuter.
- Si Gemini ne propose pas nativement d'embeddings adaptés au RAG, tu peux proposer une brique complémentaire, mais le modèle de génération/réponse doit rester Gemini.

## Contraintes techniques d'infrastructure — À RESPECTER IMPÉRATIVEMENT

L'application sera déployée sur un VPS OVH existant qui fait déjà tourner un conteneur **Traefik v3.1** en reverse proxy pour d'autres services. Tu ne dois ni recréer ni reconfigurer Traefik : ton service doit simplement s'y raccorder.

- **Réseau Docker externe obligatoire** : `audit-app_web` — le service applicatif doit rejoindre ce réseau en tant que réseau externe (`external: true`), c'est ce réseau qui permet à Traefik de router le trafic vers le conteneur.
- **Certificat SSL** : géré par le resolver `letsencrypt`, déjà configuré sur le VPS. Ne pas recréer de resolver, seulement le référencer dans les labels.
- **Entrypoint** : `websecure` (port 443).
- **Labels Traefik v3.1** à ajouter sur le service (exemple, à adapter au sous-domaine réel) :
  ```yaml
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.optisafe.rule=Host(`optisafe.alsek.fr`)"
    - "traefik.http.routers.optisafe.entrypoints=websecure"
    - "traefik.http.routers.optisafe.tls.certresolver=letsencrypt"
    - "traefik.http.services.optisafe.loadbalancer.server.port=<port_interne_de_l_app>"
  ```
- Le sous-domaine `optisafe.alsek.fr` est utilisé en première phase (test/validation). Le domaine final `optisafe.fr` sera basculé en production une fois l'application validée — prévoir que le nom de domaine ne soit pas codé en dur dans l'application (variable d'environnement).
- **docker-compose.yml** attendu à la racine du projet, avec le réseau externe déclaré ainsi :
  ```yaml
  networks:
    audit-app_web:
      external: true
  ```
- Le service ne doit PAS exposer de port sur l'hôte directement (`ports:`) — tout le trafic doit transiter par Traefik via le réseau `audit-app_web`.

## Contraintes de workflow

- Le développement se fait en local (par toi, Antigravity).
- Le déploiement se fait manuellement par moi via **GitHub Desktop** : je récupère ton code depuis un dépôt Git, puis je le pousse/synchronise vers le VPS. En conséquence :
  - Structure le projet comme un repo Git propre dès le départ.
  - Fournis un `.gitignore` excluant : `.env`, `node_modules` (ou équivalent selon stack), fichiers de contrats uploadés par les utilisateurs, tout secret.
  - Fournis un `.env.example` documentant toutes les variables d'environnement nécessaires (DB, clé API IA, etc.), sans valeurs réelles.
  - Documente dans un `README.md` la procédure de déploiement sur le VPS (ex: `docker compose up -d --build` après pull du repo).

## Stack technique

Propose une stack adaptée aux contraintes ci-dessus (conteneurisable, compatible Traefik/Docker), en précisant tes choix pour : backend, frontend, base de données, stockage des fichiers contrats, et moteur/API utilisé pour l'extraction et la recherche IA (Gemini, voir ci-dessus). Justifie brièvement chaque choix.

## Charte graphique — À RESPECTER IMPÉRATIVEMENT

L'identité visuelle du produit est déjà validée (logo, palette, typographie). Le fichier `06-charte-graphique-ui-ux.md` joint à ce prompt fait foi et doit être appliqué dès l'intégration front-end. Points clés à retenir :
- Palette : Bleu `#0D47A1` (primaire), Turquoise `#26A69A` (secondaire), Orange `#F57C00` (réservé strictement à la Fiche d'Urgence et aux alertes critiques)
- Fond app `#F8F9FA`, cartes en blanc pur avec ombre légère
- Titres en Montserrat/Poppins (Semi-Bold/Bold), corps de texte en Inter/Roboto
- Composants en cartes ("Soft SaaS"), border-radius 6-8px, icônes linéaires outline
- Les contrats/comparaisons s'affichent en cartes blanches sur fond gris clair, avec mise en évidence des doublons de garanties en turquoise à 10% d'opacité

Ne dévie pas de cette charte sans justification explicite.

## Livrables attendus

1. Architecture technique proposée (avec justification des choix)
2. Code source structuré en repo Git, prêt à être versionné
3. `docker-compose.yml` conforme aux contraintes réseau/Traefik ci-dessus
4. `.env.example` et `README.md` de déploiement
5. Un plan de développement par étapes (infrastructure → import/comparaison → fiche d'urgence → recherche IA → tests)
6. Intégration front-end conforme à la charte graphique jointe

Avant de commencer à coder, présente-moi ton plan d'architecture et la taxonomie de garanties que tu comptes utiliser pour la comparaison — ce sont les deux points structurants à valider en premier.
