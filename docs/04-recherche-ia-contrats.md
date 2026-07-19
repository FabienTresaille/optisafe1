# 04 — Recherche IA dans les contrats (cas non prévus)

## Objectif
Quand un cas d'usage demandé par l'utilisateur n'est pas déjà présent dans la fiche d'urgence, l'IA doit chercher la réponse directement dans le texte du/des contrat(s) et la restituer clairement.

## À faire
- [ ] Indexation du contenu des contrats (texte extrait) pour recherche sémantique (embeddings + base vectorielle, ou recherche full-text selon volumétrie)
- [ ] Interface de question libre ("Que couvre mon contrat en cas de X ?")
- [ ] Prompt IA avec récupération du passage pertinent du contrat (RAG) avant de formuler la réponse
- [ ] Citation de la clause/page du contrat utilisée comme source, pour la confiance de l'utilisateur
- [ ] Gestion du cas "information absente du contrat" (réponse honnête plutôt qu'une réponse inventée)
- [ ] Option d'ajouter la question/réponse générée à la fiche d'urgence si jugée utile (apprentissage progressif de la fiche)

## Décisions techniques
- Modèle IA retenu : **Gemini** (via l'abonnement Google AI Pro existant)
- Stratégie RAG et base vectorielle : à définir avec Antigravity, en cohérence avec l'API Gemini (embeddings Gemini si disponibles, sinon solution externe compatible)

## Blocages / points de vigilance
- Éviter les hallucinations : toujours ancrer la réponse dans le texte réel du contrat
- Coût API IA à surveiller selon le volume de requêtes
