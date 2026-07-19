# 02 — Import & comparaison de contrats

## Objectif
Permettre à l'utilisateur de comparer plusieurs contrats/offres d'assurance, via deux voies d'entrée.

## Voie A — Import de contrat (PDF)
- [ ] Upload de fichier (PDF, éventuellement photo/scan)
- [ ] Extraction du texte (OCR si scan, parsing direct si PDF natif)
- [ ] Extraction structurée des infos clés via IA (garanties, exclusions, plafonds, franchises, cotisation)
- [ ] Validation/correction manuelle par l'utilisateur des infos extraites
- [ ] Stockage du contrat (fichier original + données structurées en DB)

## Voie B — Saisie manuelle de l'offre
- [ ] Formulaire structuré (compagnie, type de contrat, garanties, plafonds, franchises, prix)
- [ ] Possibilité de dupliquer/adapter une offre existante pour comparer une variante

## Moteur de comparaison
- [ ] Définir le référentiel commun de garanties (taxonomie partagée entre tous les contrats, pour pouvoir comparer "pomme contre pomme")
- [ ] Tableau comparatif entre 2+ contrats/offres (garanties communes, différences, points forts/faibles)
- [ ] Mise en avant des écarts significatifs (ex: franchise plus élevée, garantie absente)

## Détection de doublons entre contrats de nature différente
- [ ] Identifier les garanties redondantes entre contrats de types différents (ex : assurance civile GMF vs garanties voyage incluses dans une carte bancaire type Visa Premier, mutuelle santé vs garantie accident d'un contrat auto, etc.)
- [ ] La taxonomie commune de garanties (ci-dessus) doit permettre ce rapprochement inter-contrats, pas seulement la comparaison entre contrats du même type
- [ ] Signaler clairement le doublon à l'utilisateur avec le détail des deux garanties concernées, pour lui permettre d'arbitrer (ex: résilier l'une des deux)

## Décisions techniques
- Modèle IA retenu pour l'extraction : **Gemini** (via l'abonnement Google AI Pro existant), à utiliser aussi bien pour l'extraction structurée que pour la recherche IA (voir fichier 04)
- (à compléter : format exact de la taxonomie)

## Blocages / points de vigilance
- Fiabilité de l'extraction automatique (nécessité d'une relecture utilisateur)
- Hétérogénéité des formats de contrats selon les assureurs
