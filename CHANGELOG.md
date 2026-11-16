# Historique des versions

## Prochaine version (v1.5.0, non testée) : modes Manuel / Éco / Confort / Boost

- Un seul sélecteur **« Mode de ventilation »** remplace « Régulation extraction » et « Régulation soufflage » :
  - **Manuel** : les deux vitesses (soufflage et extraction) se règlent à la main ;
  - **Éco**, **Confort**, **Boost** : extraction à pression constante, avec une consigne par mode : **90 Pa** (Éco, nuit), **125 Pa** (Confort, jour), **170 Pa** (Boost). « Consigne dépression extraction » devient « Consigne dépression – Confort ».
- **Soufflage automatique** en Éco / Confort / Boost : il suit l'extraction, avec l'écart réglable « Soufflage – écart / extraction ». Le mode « Équilibrage auto » et son réglage « rapport des débits visé » sont supprimés. Bouger un curseur à la main fait passer en Manuel.
- Nouvelle automatisation [`vmc-mode-nuit.yaml`](homeassistant/automations/vmc-mode-nuit.yaml) : Éco de 22 h à 8 h, Confort le jour, sans toucher à un Boost ou un Manuel choisi à la main. Elle remplace `vmc-soufflage-nuit.yaml` (supprimée).
- By-pass ouvert : la consigne free-cooling ne s'applique que si elle est plus élevée que celle du mode (un Boost reste un Boost).
- Carte Home Assistant (tuiles) : sélecteur de mode, et curseurs des deux ventilateurs affichés **seulement en mode Manuel** (carte conditionnelle).
- Page web de l'ESP : **boutons de mode** sous le schéma, utilisables sans code. Les curseurs des ventilateurs restent dans ⚙ Configurer (code requis).
- **Réglages épurés** : l'antigel (seuil 1 °C, baisse maxi 40 %), la durée des filtres (180 jours) et la réactivité de la régulation (0,05 %/Pa) sont fixés dans le programme (substitutions en haut du YAML) et ne sont plus modifiables depuis Home Assistant. Le bouton « Filtres changés » reste.
- Supprimés : « By-pass probablement ouvert » (le by-pass est piloté, la carte affiche l'état du relais) et « Économie moyenne par jour ».

## v1.4.1 (16/11/2026) : correction

- **« COP – aide au réglage »** était indisponible dans Home Assistant : ce texte d'aide était classé en catégorie « config », réservée aux réglages modifiables. Il passe en catégorie **« diagnostic »**. Il reste affiché dans « Réglages » sur la page web de l'ESP.

## v1.4.0 (15/11/2026) : remises à zéro datées et économie par jour

- **Remises à zéro datées** : l'ESP prend l'heure de Home Assistant (ou d'Internet en SNTP s'il tourne seul) et enregistre la date de la dernière remise à zéro de l'énergie (« Énergie récupérée – comptée depuis le ») et du dernier changement de filtres (« Filtres – changés le »).
- Nouveau capteur **« Économie moyenne par jour »** (€/j) : économie ÷ nombre de jours depuis la remise à zéro datée de l'énergie.
- Prix du kWh par défaut : **0,21 €** (tarif Base 2026, abonnement compris), au lieu de 0,17 €.

## v1.3.1 (15/11/2026) : économie calculée sur l'énergie

- « Économie estimée » est maintenant calculée directement à partir de l'**énergie récupérée** : énergie ÷ COP × prix du kWh. Elle tient compte de toute l'énergie déjà récupérée, se recalcule si le prix ou le COP change, et suit la remise à zéro de l'énergie.

## v1.3.0 (15/11/2026) : économie en euros

- Deux nouveaux réglages : **« Prix du kWh électrique »** (0,17 €/kWh par défaut) et **« COP du chauffage remplacé »** (1 pour des radiateurs électriques, 3 à 4 pour une clim ou une PAC).
- Nouveau compteur **« Économie estimée »** (€) : chaleur récupérée ÷ COP × prix du kWh, cumulé dans le temps. Il est remis à zéro avec le bouton de l'énergie récupérée.
- Aide **« COP – aide au réglage »** affichée sous les réglages : quel COP choisir selon le chauffage remplacé.
- Synoptique de l'ESP : l'économie s'affiche à côté de l'énergie récupérée. Carte Home Assistant : l'économie s'affiche en haut du schéma.

## v1.2.1 (15/11/2026) : corrections

- Sans étalonnage, le **« Débit estimé »** correspond maintenant au débit de soufflage **à 100 %** et suit la vitesse réellement envoyée (mode nuit et antigel compris). Avant, il restait fixe, ce qui surestimait la puissance et l'énergie récupérées à vitesse réduite.
- Synoptique : « Équilibre débits » affiche « calcul… » pendant la première minute après un démarrage, et « (doux) » seulement quand l'écart reprise − extérieur est inférieur à 6 °C.

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
