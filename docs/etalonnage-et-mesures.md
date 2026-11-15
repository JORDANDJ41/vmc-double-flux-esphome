# Étalonnage et mesures

## Formules utilisées

- Rendement côté soufflage : η_s = (T_insufflation − T_ext) / (T_reprise − T_ext)
- Rendement côté extraction : η_e = (T_reprise − T_rejet) / (T_reprise − T_ext)
- **Rapport des débits** : Q_extraction / Q_soufflage = (T_insufflation − T_ext) / (T_reprise − T_rejet)
  - 1,0 = équilibré ; supérieur à 1 = maison en dépression.
  - Ce rapport est un peu **surestimé** : chaleur du moteur de soufflage placé après l'échangeur, condensation en hiver, pertes du caisson.
- Puissance récupérée : P ≈ 0,34 × Q (m³/h) × (T_insufflation − T_ext), en W.
- Calculs effectués seulement si T_reprise − T_ext ≥ 6 °C (`delta_min`). En dessous, la mesure est trop imprécise.

## Bonnes pratiques

- Après un changement de vitesse, attendre **30 à 60 minutes** avant de juger sur les températures (inertie de l'échangeur, des gaines et du caisson).
- Sondes **dans le flux**, au centre du piquage, sans toucher les parois. Les parois du caisson sont froides si la VMC est dans les combles.
- **Perte du réseau d'extraction** = T des pièces d'extraction (salles de bain, WC, cuisine) − T reprise. Objectif : 1 à 2 °C. Une reprise qui suit la température des combles (soleil, nuit) indique une isolation encore insuffisante.

## Mesure des débits

### Anémomètre à fil chaud, dans une gaine

1. Portion droite, au moins 5 diamètres après un coude, ou juste **avant** un coude si la place manque.
2. Petit trou (8-10 mm). Plusieurs points sur le diamètre, puis la moyenne (à défaut, la vitesse au centre × 0,85).
3. Débit (m³/h) = vitesse moyenne (m/s) × section (m²) × 3600.

| Gaine | Section | 1 m/s donne |
|---|---|---|
| Ø 160 | 0,0201 m² | 72 m³/h |
| Ø 125 | 0,0123 m² | 44 m³/h |
| Ø 80 | 0,0050 m² | 18 m³/h |

Sans longueur droite disponible : mettre un **tube de 40-50 cm** du même diamètre sur la bouche, et mesurer à son extrémité.

### Méthode du sac (soufflage uniquement)

Sac de volume connu plaqué sur la bouche : débit (m³/h) = volume (L) ÷ temps de remplissage (s) × 3,6.

### Relevés à faire pour l'étalonnage

| Soufflage % | Extraction % | Q soufflage mesuré | Q extraction mesuré | Pression extraction (Pa) | Rapport des débits |
|---|---|---|---|---|---|
| 100 | | | | | |
| 75 | | | | | |
| 50 | | | | | |
| 25 | | | | | |

## Saisie de l'étalonnage dans l'ESP

Section **« Étalonnage des débits »** (page web → Configurer, ou Home Assistant) : **4 points par ventilateur**, débit mesuré à **25, 50, 75 et 100 %**, pour le soufflage et pour l'extraction.

- On peut ne remplir **que certains points**. Seuls les points non nuls sont utilisés, avec 1 à 4 points.
- Entre deux points : **interpolation linéaire**. En dehors : proportionnel à la vitesse (loi des ventilateurs) à partir du point le plus proche.
- **Aucun point saisi** : le soufflage reprend le « Débit estimé » manuel (débit à 100 %), proportionnellement à la vitesse envoyée, et l'extraction est estimée par soufflage × rapport des débits.
- Les capteurs **Débit soufflage** et **Débit extraction** (m³/h) sont affichés sous les ventilateurs (page web et carte Home Assistant).
- La **puissance et l'énergie récupérées** utilisent le débit de soufflage étalonné. Le débit de soufflage tient compte de l'antigel.
