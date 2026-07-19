# 03 — Fiche "en cas d'urgence"

## Objectif
Générer, à partir des contrats renseignés par l'utilisateur, une fiche synthétique listant les principaux cas d'usage (que faire / qui appeler / quelle couverture) en situation d'urgence.

## À faire
- [ ] Définir la liste des cas d'usage principaux à couvrir par défaut (ex: dégât des eaux, bris de glace, vol, accident, panne, assistance...)
- [ ] Associer chaque cas d'usage à un modèle de fiche (structure : démarche à suivre, contacts, plafond/franchise applicable)
- [ ] Génération automatique de la fiche à partir des données structurées du contrat (issues de la fonctionnalité 02)
- [ ] Interface de consultation rapide (mobile-friendly, accès facile en situation de stress)
- [ ] Export/impression de la fiche (PDF, ajout à l'écran d'accueil, etc.)
- [ ] Mise à jour automatique de la fiche si le contrat est modifié/remplacé

## Décisions techniques
- (à compléter : format de la fiche, priorisation des cas d'usage)

## Blocages / points de vigilance
- Fiabilité et clarté de l'information affichée (contexte d'urgence = pas de place à l'ambiguïté)
- Lien direct avec la fonctionnalité IA (04) pour les cas non couverts par défaut
