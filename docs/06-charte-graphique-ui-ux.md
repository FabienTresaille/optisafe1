# 06 - Charte Graphique et UI/UX - Optisafe.fr

**Projet :** Optisafe.fr (SaaS)
**Développement :** Équipe Antigravity

Ce document définit les lignes directrices visuelles et ergonomiques de l'application Optisafe.fr, basées sur le logotype validé. Il sert de référence pour l'intégration front-end et vient s'ajouter aux documentations techniques existantes (Roadmap, Infrastructure Traefik/Docker, Imports, etc.).

---

## 1. Identité Visuelle & Palette de Couleurs

Le logo d'Optisafe repose sur un triptyque colorimétrique symbolisant la sécurité (Bleu profond), la fluidité de comparaison (Turquoise) et l'urgence (Orange). Ces couleurs doivent guider l'ensemble de l'interface utilisateur.

### Couleurs Principales (Brand Colors)
*   **Bleu Optisafe (Primaire)** : `#0D47A1` (Bleu de confiance)
    *   *Usage* : Barres de navigation, en-têtes, boutons d'actions standards, texte de mise en avant.
*   **Turquoise (Secondaire)** : `#26A69A` (Dynamisme et synchronisation)
    *   *Usage* : Éléments interactifs secondaires, graphiques de comparaison, badges de statuts "Optimisé".
*   **Orange Urgence (Accent/Action Critique)** : `#F57C00` (Vitalité et alerte)
    *   *Usage* : Strictement réservé aux éléments liés à la **Fiche d'Urgence**, aux alertes importantes et aux boutons "Call to Action" cruciaux.

### Couleurs de Fond & Neutres (Grayscale)
*   **Fond principal (App Background)** : `#F8F9FA` (Gris très clair, réduit la fatigue visuelle)
*   **Surfaces (Cartes de contrats, Modales, Dashboard)** : `#FFFFFF` (Blanc pur) avec une ombre légère pour créer de la profondeur (`box-shadow: 0 4px 6px rgba(0,0,0,0.05);`).
*   **Texte principal** : `#2D3436` (Gris anthracite, plus doux que le noir pur pour la lecture de longs contrats).
*   **Texte secondaire / Labels** : `#636E72`.

---

## 2. Typographie

Pour garantir une lisibilité optimale lors de la lecture de données contractuelles complexes et conserver une interface SaaS moderne :

*   **Titres (Headings - H1, H2, H3)** : *Montserrat* ou *Poppins*.
    *   *Style* : Sans-serif géométrique, rassurante. Poids : Semi-Bold (600) ou Bold (700).
*   **Corps de texte (Body, Tableaux, Data)** : *Inter* ou *Roboto*.
    *   *Style* : Conçues pour les interfaces numériques, excellente lisibilité pour les données tabulaires et les chiffres. Poids : Regular (400) et Medium (500).

---

## 3. Logotype & Règles d'utilisation

*   **Symbole** : Le bouclier (contenant les documents, flèches cycliques et croix d'urgence) peut être utilisé indépendamment comme **Favicon** ou icône d'application mobile.
*   **Déclinaison monochrome** : Lors d'impressions ou sur des fonds sombres, le logo doit passer intégralement en blanc pur (`#FFFFFF`).
*   **Zone de protection (Clear Space)** : Toujours laisser un périmètre d'espace vide équivalent à la hauteur du "O" de OPTISAFE autour du logo complet pour garantir son impact.

---

## 4. Composants UI (Directives d'intégration)

### Boutons (Buttons)
*   **Primaire (Valider, Enregistrer)** : Fond Bleu Optisafe, texte blanc. Rayon de bordure (border-radius) de `6px` à `8px` pour un aspect "Soft SaaS".
*   **Action Urgence (Générer/Voir Fiche Urgence)** : Fond Orange, texte blanc, avec potentiellement une légère animation de pulsation ("pulse") au survol.
*   **Secondaire / Ghost (Annuler, Retour)** : Fond transparent, bordure Bleu ou Turquoise (`border: 1px solid`), texte coloré.

### Cartes et Tableaux de Comparaison (Les "Contrats")
*   L'affichage des contrats doit utiliser le design en **"Cartes"** sur fond blanc, se détachant du fond gris clair global.
*   **Mise en évidence des doublons** : Les lignes de garanties en doublon ("pomme contre pomme") doivent être surlignées avec un fond très léger (ex: `#26A69A` avec 10% d'opacité) ou signalées par une icône d'alerte.

### Iconographie
*   *Style* : Linéaire (Outline), moderne, épaisseur de trait (stroke-width) constante (environ `1.5px`).
*   Privilégier les icônes aux angles légèrement arrondis pour rester cohérent avec les courbes du bouclier du logo.
