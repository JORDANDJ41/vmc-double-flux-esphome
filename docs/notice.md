# Notice complète : installation, programmation et utilisation

Cette notice accompagne les configurations ESPHome du dépôt. Elle s'adresse à quelqu'un qui connaît les bases de Home Assistant et de l'électricité.

> ⚠️ **Sécurité** : coupez et consignez le 230 V avant toute intervention dans la VMC. Les condensateurs des moteurs EC peuvent rester chargés plusieurs minutes. Remplacer la régulation d'origine annule la garantie du fabricant.

---

## Sommaire

1. [Matériel nécessaire](#1-matériel-nécessaire)
2. [Préparer Home Assistant et ESPHome](#2-préparer-home-assistant-et-esphome)
3. [Créer l'appareil et installer le programme](#3-créer-lappareil-et-installer-le-programme)
4. [Câbler la VMC](#4-câbler-la-vmc)
5. [Premier démarrage et vérifications](#5-premier-démarrage-et-vérifications)
6. [La page web de l'ESP](#6-la-page-web-de-lesp)
7. [Tous les réglages, expliqués](#7-tous-les-réglages-expliqués)
8. [Les cartes Home Assistant](#8-les-cartes-home-assistant)
9. [Mise en service conseillée](#9-mise-en-service-conseillée)
10. [Dépannage](#10-dépannage)
11. [Mettre à jour](#11-mettre-à-jour)

---

## 1. Matériel nécessaire

### Version recommandée : KinCony KC868-A6

| Élément | Remarque |
|---|---|
| KinCony KC868-A6 (ESP32), idéalement avec son boîtier | 2 sorties 0-10 V, 4 entrées analogiques, 2 entrées 1-Wire, 6 relais |
| Alimentation 12 V DC, 1 A minimum | alimente aussi le capteur de pression |
| 4 sondes DS18B20 étanches | air neuf, insufflation, reprise, rejet |
| Câble USB-C | pour le premier flash |
| WAGO, gaines, colliers | séparer le 230 V de la très basse tension |

Le capteur de pression d'origine (Huba, 0,5-4,5 V) et les moteurs EC 0-10 V sont conservés.

### Version de transition : ESP32 DevKit + platine

Voir [`cablage-esp32-devkit.md`](cablage-esp32-devkit.md). Elle fonctionne, mais elle est plus fragile : un mauvais câblage du +10 V des moteurs peut les détruire (voir [`retour-d-experience.md`](retour-d-experience.md)).

---

## 2. Préparer Home Assistant et ESPHome

1. Installer le module complémentaire **ESPHome Device Builder** (Paramètres → Modules complémentaires).
2. Installer **File editor** (ou Studio Code Server / Samba) pour copier des fichiers dans `/config`.
3. Dans ESPHome Builder, bouton **Secrets** (en haut à droite) : renseigner les secrets du fichier [`esphome/secrets.example.yaml`](../esphome/secrets.example.yaml) :
   ```yaml
   wifi_ssid: "MonReseau"
   wifi_password: "MonMotDePasseWifi"
   vmc_api_key: "..."      # généré par le Builder à la création de l'appareil
   ap_password: "..."      # mot de passe du point d'accès de secours
   ```
4. Pour les cartes Home Assistant : installer **Mushroom** via HACS (uniquement pour la carte en tuiles).

---

## 3. Créer l'appareil et installer le programme

1. ESPHome Builder → **New Device** → nom `vmc` → choisir la carte **KinCony KC868-A6** (ou « Generic ESP32 »).
2. Noter la **clé API** générée (à mettre dans `vmc_api_key` si vous utilisez `!secret`).
3. **Edit** sur l'appareil → remplacer **tout** le contenu par [`esphome/vmc-kincony-a6.yaml`](../esphome/vmc-kincony-a6.yaml). Supprimer toute ligne `packages:` ou `dashboard_import:` laissée par le Builder.
4. Copier [`esphome/vmc_synoptique.js`](../esphome/vmc_synoptique.js) **dans `/config/esphome/`**, à côté du `.yaml`. Il est intégré à la compilation.
5. **Validate**. Vous devez obtenir « Configuration is valid! ».
6. **Install** :
   - premier flash : **Plug into this computer** (USB-C sur le PC) ou « Manual download » puis ESPHome Web ;
   - ensuite : **Wirelessly** (OTA).
7. Home Assistant détecte l'appareil : **Paramètres → Appareils et services → ESPHome → Configurer**.

> 💡 La ligne `local: true` ne doit **pas** être présente dans `web_server` : sinon le schéma de la page web n'est pas chargé.

---

## 4. Câbler la VMC

Le brochage détaillé est dans [`cablage-kincony-a6.md`](cablage-kincony-a6.md). En résumé :

| VMC | KC868-A6 |
|---|---|
| Moteur soufflage, fil **jaune** | **DA-1** |
| Moteur extraction, fil **jaune** | **DA-2** |
| Fils **bleus** des moteurs | GND |
| Fils **rouges** (+10 V) des moteurs | **non utilisés, à isoler** |
| Huba : jaune / vert / bleu | A1 / GND / +12 V |
| DS18B20 : DATA / alimentation / GND | IO-1 / borne d'alimentation capteurs / GND |
| Phase moteur soufflage | relais 1 : COM → **NC** → moteur |
| Phase moteur extraction | relais 2 : COM → **NC** → moteur |
| Phase actionneur by-pass (230 V, rappel par ressort) | relais 3 : COM → **NO** → actionneur |

**Placement des sondes** : dans le flux d'air, au centre des piquages de la machine, sans toucher les parois.

---

## 5. Premier démarrage et vérifications

1. **Journaux** (ESPHome Builder → Logs) : les 4 sondes doivent apparaître (« Sonde 1 » à « Sonde 4 »), sans « Found no devices ».
2. **Affectation des sondes** : voir §7.1.
3. **Sorties 0-10 V** : mettre une vitesse à 100 % et mesurer DA-1 au multimètre. Ajuster `dac_echelle` en haut du `.yaml` si besoin (exemple : 10,4 V mesurés → `0.96`).
4. **Capteur de pression** : comparer « Capteur pression – tension » à la tension mesurée sur le fil jaune du Huba, et ajuster `ai_echelle`.
5. **Relais** : basculer « Coupure moteur soufflage » → le moteur doit s'arrêter, puis repartir quand on la désactive.
6. **By-pass** : mode « Forcé ouvert » → le volet doit s'ouvrir, puis « Forcé fermé » → il se referme.

---

## 6. La page web de l'ESP

Adresse : `http://<IP-de-l-ESP>` ou `http://vmc.local`. Elle fonctionne **sans Home Assistant**.

- **Schéma animé** : températures, rendement, ventilateurs (vitesse et débit), by-pass, puissance, énergie, équilibre et pression.
- **Pastilles d'alerte** : givre, antigel actif, air soufflé froid, by-pass, filtres.
- **Boutons de mode** (Manuel, Éco, Confort, Boost) : seul réglage accessible sans code. En Manuel, les curseurs des ventilateurs se règlent dans ⚙ Configurer.
- **⚙ Configurer** : code `admin` par défaut. Modifiable en haut de `vmc_synoptique.js` (`CODE_CONFIG`), puis recompiler.

> Le code ne fait que **masquer** la configuration. Pour une vraie protection (installation chez un client), activez le bloc `auth:` dans `web_server` : le navigateur demandera alors un identifiant et un mot de passe.
>
> La page de configuration charge son interface depuis Internet (site d'ESPHome). Le schéma, lui, fonctionne hors ligne.

---

## 7. Tous les réglages, expliqués

### 7.1 Sondes – affectation

| Réglage | Rôle |
|---|---|
| Sonde 1 à 4 | températures brutes, dans l'ordre de détection sur le bus |
| Affectation – air neuf / insufflation / reprise / rejet | quelle sonde joue quel rôle |

**Procédure** : pincer une sonde entre les doigts une minute, repérer la « Sonde X » qui monte, et l'affecter au bon rôle. Les choix sont mémorisés. Il n'y a rien à recompiler en cas de remplacement d'une sonde.

### 7.2 Commande des ventilateurs

| Réglage | Rôle |
|---|---|
| Vitesse soufflage / extraction (10-100 %) | 10 % = 1 V, 100 % = 10 V sur le fil jaune. Réglage à la main en mode **Manuel** ; en Éco / Confort / Boost, c'est la régulation qui les pilote |
| Coupure moteur soufflage / extraction | coupe le 230 V (relais câblés en NF : au repos, le moteur tourne) |

**Bouger un curseur à la main fait passer le mode de ventilation en Manuel**, et il y reste. Sur la carte Home Assistant fournie, les deux curseurs n'apparaissent qu'en mode Manuel.

### 7.3 Régulation automatique

| Réglage | Valeur par défaut | Rôle |
|---|---|---|
| Mode de ventilation | Confort | **Manuel** : les deux vitesses se règlent à la main. **Éco**, **Confort**, **Boost** : extraction à pression constante avec la consigne du mode, et soufflage qui suit l'extraction |
| Consigne dépression – Éco (nuit) | 90 Pa | moins de bruit et de consommation la nuit |
| Consigne dépression – Confort | 125 Pa | régime normal de jour |
| Consigne dépression – Boost | 170 Pa | coup de ventilation (odeurs, séchage, soirée d'été) |
| Soufflage – écart / extraction | −5 % | en Éco / Confort / Boost : soufflage = extraction + écart (négatif = légère dépression, positif = légère surpression) |

- **Modes de ventilation** : les consignes sont mesurées au caisson (capteur de pression). Les gaines font perdre quelques Pa jusqu'aux bouches. Des bouches hygro B fonctionnent entre 80 et 160 Pa : vérifiez au manomètre si possible, la bouche la plus proche en Boost et la plus éloignée en Éco. Le changement de mode se fait à la main ou par un planning Home Assistant (automatisation fournie, voir §8). Si le by-pass est ouvert, la consigne free-cooling s'applique quand elle est plus élevée.
- **Pression constante** : quand les bouches hygro s'ouvrent, la pression baisse et l'extraction accélère. Zone morte ±3 Pa, variation de 3 % maximum toutes les 5 s.
- **Soufflage** : en Éco / Confort / Boost, il suit l'extraction avec l'écart réglé, ce qui garde la maison équilibrée. Pour corriger un déséquilibre (voir « Rapport débits »), ajustez l'écart. En Manuel, il se règle à la main, indépendamment.

### 7.4 Antigel

Réglages fixes, inscrits dans le programme (non modifiables depuis Home Assistant) : déclenchement si la **T rejet passe sous 1 °C**, baisse maximale du soufflage de **40 %** (pour ne pas mettre la maison en forte dépression). Pour les changer, modifier `antigel_seuil` et `antigel_max` en haut du YAML et réinstaller.

Sous le seuil, le soufflage baisse de **5 % par minute** et l'extraction augmente (+0,5 Pa par % en pression constante, ou +½ de la baisse en manuel). Au-dessus du seuil + 2 °C, le retour se fait de 5 % par minute. **Le soufflage n'est jamais coupé.** Les curseurs ne sont pas modifiés : seule la commande réelle des moteurs est corrigée.

**Test** : mettre provisoirement `antigel_seuil` au-dessus de la T rejet actuelle, réinstaller, vérifier que « Antigel – baisse du soufflage » monte, puis remettre 1.0.

### 7.5 By-pass / free-cooling

| Réglage | Défaut | Rôle |
|---|---|---|
| By-pass – mode | Forcé fermé | Automatique / Forcé fermé / Forcé ouvert |
| By-pass – ouverture si reprise > | 24 °C | la maison est trop chaude |
| By-pass – air neuf mini | 12 °C | ne pas souffler trop froid |
| By-pass – écart mini reprise/air neuf | 2 °C | l'air neuf doit être plus frais |
| Consigne dépression free-cooling (été) | 160 Pa | consigne de pression utilisée quand le by-pass est ouvert |

En mode Automatique, le by-pass s'ouvre si **les trois conditions** sont réunies, avec 1 °C d'hystérésis et une vérification toutes les 5 min. Si une sonde est en défaut, il reste fermé.

### 7.6 Étalonnage des débits

8 cases : débit mesuré à **25, 50, 75 et 100 %**, pour le soufflage et pour l'extraction. Seules les cases non nulles sont utilisées. Méthodes de mesure : [`etalonnage-et-mesures.md`](etalonnage-et-mesures.md).

| Capteur | Calcul |
|---|---|
| Débit soufflage | courbe d'étalonnage selon la vitesse réellement envoyée (antigel compris), sinon « Débit estimé » (débit à 100 %) × vitesse |
| Débit extraction | courbe d'étalonnage, sinon soufflage × rapport des débits |
| Puissance récupérée | 0,34 × débit soufflage × (T insufflation − T air neuf) |
| Économie estimée | énergie récupérée ÷ « COP du chauffage remplacé » × « Prix du kWh électrique » (€), recalculée si le prix ou le COP change |

### Régler l'économie estimée

| Chauffage remplacé | « COP du chauffage remplacé » | « Prix du kWh électrique » |
|---|---|---|
| Radiateurs électriques | 1 | prix de l'électricité |
| Clim ou PAC air/air | 3 à 4 | prix de l'électricité |
| PAC air/eau | environ 3 | prix de l'électricité |
| Poêle à granulés | 0,9 (rendement du poêle) | prix du kWh de granulés (environ 0,08 €) |

Avec plusieurs chauffages, prendre une valeur intermédiaire selon celui qui chauffe le plus. Le bouton « Remise à zéro énergie récupérée » enregistre la date (capteur « Énergie récupérée – comptée depuis le »). Le bouton « Filtres changés » enregistre aussi sa date.

Valeur par défaut : 0,21 €/kWh, une moyenne pour le tarif Base en 2026. Le prix est fixe : avec un tarif comme Tempo, mettre plutôt une moyenne d'hiver (environ 0,17 €/kWh en 2026).

### 7.7 Filtres

| Réglage | Rôle |
|---|---|
| Filtres – jours d'utilisation | compteur |
| Filtres changés (remise à zéro) | à presser après le remplacement |

Durée fixe de **180 jours** avant l'alerte « Filtres à changer » (réglage `filtre_seuil` en haut du YAML).

### 7.8 Indicateurs

| Capteur | Interprétation |
|---|---|
| Rendement côté soufflage / extraction | ils doivent être proches quand les débits sont équilibrés |
| Écart rendements | grand écart = déséquilibre des débits |
| Rapport débits extraction sur soufflage | 1,0 à 1,1 = idéal ; au-dessus de 1,3 = forte dépression |
| Pression réseau extraction | dépression du réseau (capteur Huba) |
| Air soufflé froid | T insufflation inférieure à 15 °C pendant 10 min |
| Risque givrage échangeur | T rejet inférieure à 1 °C pendant 5 min |

Les rendements et le rapport des débits ne sont calculés que si l'écart reprise/extérieur est d'au moins 6 °C. Par temps doux, ils restent vides.

---

## 8. Les cartes Home Assistant

1. Copier [`homeassistant/www/vmc_ha.svg`](../homeassistant/www/vmc_ha.svg) et [`vmc_ha_bypass.svg`](../homeassistant/www/vmc_ha_bypass.svg) dans `/config/www/`.
2. Tableau de bord → Ajouter une carte → Manuel → coller [`carte-schema.yaml`](../homeassistant/dashboards/carte-schema.yaml) (schéma) et/ou [`carte-tuiles.yaml`](../homeassistant/dashboards/carte-tuiles.yaml) (tuiles Mushroom).
3. Régler la **précision d'affichage** des entités (⚙ de chaque entité) : 1 décimale pour les températures, 0 pour la puissance, 2 pour le rapport des débits.
4. Si vous avez nommé l'appareil autrement que `vmc`, adapter les `entity_id` (`sensor.vmc_…`).

Automatisations fournies :
- [`vmc-mode-nuit.yaml`](../homeassistant/automations/vmc-mode-nuit.yaml) : mode **Éco** de 22 h à 8 h, **Confort** le jour. Elle ne touche pas à un mode Boost ou Manuel choisi à la main.

---

## 9. Mise en service conseillée

1. Vérifier les sondes, les sorties 0-10 V et la pression (§5).
2. Commencer en mode **Manuel**, avec les deux vitesses à environ 70 %, et laisser stabiliser 1 h.
3. **Mesurer les débits** (fil chaud ou cône) aux 4 vitesses et les saisir (§7.6).
4. Noter la **pression extraction** au régime nominal, et en faire la **consigne**.
5. Passer en mode **Confort** (pression constante). Le soufflage suit l'extraction avec l'écart réglé (−5 % par défaut).
6. Vérifier sur 24 h : rapport des débits entre 1,0 et 1,1 (sinon ajuster l'écart du soufflage), pas d'oscillation de vitesse, rendements proches.
7. En été : by-pass en **Automatique**.

> 🔥 Avec un appareil à combustion qui prend son air dans la maison (poêle, insert, chaudière), évitez toute forte dépression et installez un **détecteur de CO**.

---

## 10. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| « Found no devices » / sondes « inconnu » | fil 1-Wire débranché, absence de tirage de 4,7 kΩ | vérifier DATA / alimentation / GND, et la résistance de tirage |
| Une température aberrante | mauvaise affectation, ou sonde hors du flux | §7.1, replacer la sonde au centre du piquage |
| Le schéma de la page web ne s'affiche pas | `local: true` présent, cache du navigateur, ancien `.js` compilé | retirer `local: true`, Ctrl + F5, recompiler |
| Accents bizarres ou script bloqué | `.js` contenant des caractères non ASCII | utiliser le `.js` du dépôt (100 % ASCII) |
| Le moteur ne descend pas en vitesse (DevKit) | résistance de tirage rouge→jaune trop faible | ≥ 4 × la résistance d'émetteur (voir câblage DevKit) |
| Le moteur reste à fond quoi qu'il arrive | entrée 0-10 V du moteur HS (+10 V rouge/bleu hors tolérance) | réparation ou échange du moteur |
| Reprise trop froide | dépression forte, fuites dans les combles, siphon vide, gaines mal isolées | voir [`retour-d-experience.md`](retour-d-experience.md) |
| Rendements et rapport vides | temps doux (écart inférieur à 6 °C) | normal |
| La régulation oscille | réactivité trop forte | baisser `pi_gain` en haut du YAML (0,05 %/Pa par défaut) et réinstaller |

---

## 11. Mettre à jour

1. Récupérer la nouvelle version du dépôt (voir [`CHANGELOG.md`](../CHANGELOG.md)).
2. Remplacer `vmc_synoptique.js` dans `/config/esphome/`.
3. Coller le nouveau `.yaml` **en gardant votre bloc `api: encryption: key:`** et vos secrets.
4. **Validate**, puis **Install** (sans fil).
5. Les réglages (consignes, affectations, étalonnage, compteur de filtres) sont **conservés** : ils sont stockés dans l'ESP.
