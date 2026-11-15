# Historique des versions

## v1.2.0 (15/11/2026) : étalonnage des débits

- Nouvelle section **« Étalonnage des débits »** : **4 points (25/50/75/100 %)** pour le soufflage et pour l'extraction. Seuls les points saisis sont utilisés, avec une interpolation linéaire entre eux.
- Nouveaux capteurs **Débit soufflage** et **Débit extraction** (m³/h), calculés en continu selon la vitesse (et l'antigel).
- La **puissance et l'énergie récupérées** utilisent le débit de soufflage étalonné.
- Page web et carte Home Assistant : débits affichés sous les ventilateurs.

## v1.1.0 (15/11/2026) : régulation automatique et antigel

### Nouveautés
- **Extraction à pression constante** : la consigne de dépression est réglable en Pa. Quand les bouches hygro s'ouvrent, l'extraction accélère, comme avec la régulation d'origine. Un réglage de réactivité est disponible.
- **Soufflage automatique** : en **suivi de l'extraction**, avec un écart réglable, ou en **équilibrage auto** sur le rapport des débits calculé avec les températures.
- **Modes par défaut (KinCony)** : extraction en Pression constante et soufflage en Suivi extraction. **Bouger un curseur à la main fait passer en Manuel**, et le mode y reste jusqu'au retour en automatique.
- **Antigel progressif** : si T rejet passe sous le seuil (1 °C par défaut), le soufflage baisse de 5 %/min, jusqu'à une baisse maximale réglable, et l'extraction augmente. Le soufflage n'est jamais coupé. Retour progressif quand T rejet remonte de 2 °C au-dessus du seuil. Les curseurs de l'utilisateur ne sont pas modifiés.
- **Free-cooling d'été (KinCony)** : une consigne de pression dédiée s'applique quand le by-pass est ouvert.
- **Page web** : pastille « Antigel actif » avec le pourcentage de baisse du soufflage.

### Mise à jour
1. Remplacer `vmc_synoptique.js` dans `/config/esphome/`.
2. Reprendre la config `.yaml` (garder vos secrets), puis Validate et Install.

## v1.0.0 (15/11/2026)

Supervision (4 sondes avec affectation sans recompiler, rendements, rapport des débits, pression, énergie), commande 0-10 V, by-pass / free-cooling, page web avec schéma animé, cartes Home Assistant et documentation.
