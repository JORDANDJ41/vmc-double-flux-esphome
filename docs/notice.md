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
12. [Utiliser la VMC sans Home Assistant](#12-utiliser-la-vmc-sans-home-assistant)

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

Ces réglages n'apparaissent **que sur la page web de l'ESP** (⚙ Configurer, section « Sondes – affectation »), pas dans Home Assistant : ils ne servent qu'à l'installation ou au remplacement d'une sonde.

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
| Consigne Éco | 90 Pa | moins de bruit et de consommation la nuit |
| Consigne Confort | 125 Pa | régime normal de jour |
| Consigne Boost | 170 Pa | coup de ventilation (odeurs, séchage, soirée d'été) |
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

Ces 8 cases et le **« Débit estimé »** se règlent **uniquement sur la page web de l'ESP** (⚙ Configurer, sections « Étalonnage des débits » et « Réglages »), pas dans Home Assistant : ce sont des réglages de mise en service. Les débits calculés (soufflage, extraction) restent dans Home Assistant.

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

Durée fixe de **365 jours** (un changement par an, préconisation constructeur pour une VMC double flux d'habitation) avant l'alerte « Filtres à changer » (réglage `filtre_seuil` en haut du YAML).

### 7.8 Indicateurs

| Capteur | Interprétation |
|---|---|
| Rendement côté soufflage / extraction | ils doivent être proches quand les débits sont équilibrés |
| Écart rendements | grand écart = déséquilibre des débits |
| Rapport débits extraction sur soufflage | 1,0 à 1,1 = idéal ; au-dessus de 1,3 = forte dépression |
| Pression réseau extraction | dépression du réseau (capteur Huba) |
| Consigne extraction | consigne de dépression appliquée selon le mode (vide en Manuel) |
| Air soufflé froid | T insufflation inférieure à 15 °C pendant 10 min |
| Risque givrage échangeur | T rejet inférieure à 1 °C pendant 5 min |

Les rendements et le rapport des débits ne sont calculés que si l'écart reprise/extérieur est d'au moins 6 °C. Par temps doux, ils restent vides.

---

## 8. Les cartes Home Assistant

Deux cartes sont fournies. On peut utiliser l'une, l'autre ou les deux.

| Carte | Fichier | Contenu | Besoin |
|---|---|---|---|
| **Schéma** | [`carte-schema.yaml`](../homeassistant/dashboards/carte-schema.yaml) | dessin de la VMC avec les températures, vitesses, débits, rendement, puissance, énergie, économie, pression et consigne | les images `.svg` (étape 1) |
| **Tuiles** | [`carte-tuiles.yaml`](../homeassistant/dashboards/carte-tuiles.yaml) | mode de ventilation, curseurs en Manuel, alertes, filtres, diagnostic | les cartes **Mushroom** (étape 2) |

### Étape 1 : copier les images du schéma (carte Schéma)

1. Télécharger [`vmc_ha.svg`](../homeassistant/www/vmc_ha.svg) et [`vmc_ha_bypass.svg`](../homeassistant/www/vmc_ha_bypass.svg).
2. Les copier dans le dossier **`/config/www/`** de Home Assistant (le créer s'il n'existe pas), avec l'application **File editor** ou **Studio Code Server** (Paramètres → Modules complémentaires), ou par le partage réseau **Samba**.
3. Si le dossier `www` vient d'être créé : **redémarrer Home Assistant** (Paramètres → Système → ⏻ en haut à droite → Redémarrer).
4. Vérifier : l'adresse `http://<IP-de-Home-Assistant>:8123/local/vmc_ha.svg` doit afficher le dessin.

### Étape 2 : installer Mushroom (carte Tuiles)

1. Installer **HACS** si ce n'est pas déjà fait (voir hacs.xyz).
2. HACS → rechercher **« Mushroom »** → Télécharger.
3. Recharger la page du navigateur (Ctrl + F5).

### Étape 3 : ajouter une carte au tableau de bord

1. Ouvrir le tableau de bord voulu, puis **✏️ (Modifier le tableau de bord)** en haut à droite.
2. **+ Ajouter une carte**, faire défiler la liste jusqu'en bas et choisir **« Manuel »**.
3. **Effacer** tout le texte proposé, puis **coller tout le contenu** du fichier `.yaml` de la carte (ouvrir le fichier sur GitHub → bouton « Copy raw file »).
4. **Enregistrer**, puis **Terminé** en haut à droite.

La carte **Schéma** est prévue en **pleine largeur** (`grid_options: columns: 24` à la fin du fichier) : plus étroite, certains textes se chevauchent.

### Mettre à jour une carte existante (nouvelle version)

1. **✏️ Modifier le tableau de bord**, survoler la carte, cliquer sur **Modifier**.
2. En bas à gauche de la fenêtre : **« Afficher l'éditeur de code »** (ou ⋮ → Éditeur de code).
3. Tout sélectionner (Ctrl + A), **coller** le nouveau contenu, **Enregistrer**, puis **Terminé**.

### Réglages conseillés

- **Précision d'affichage** de chaque entité (Paramètres → Appareils et services → ESPHome → VMC → cliquer sur l'entité → ⚙) : 1 décimale pour les températures, 0 pour la puissance, 2 pour le rapport des débits.
- Les noms d'entités viennent du `friendly_name` de l'appareil (`VMC` → `sensor.vmc_…`). Avec un autre nom, ils changent : faire un rechercher/remplacer de `vmc_` dans le texte de la carte avant de la coller.
- **Carte vide ou « entité non disponible »** : vérifier le nom de l'appareil (point précédent), que l'ESP est bien en ligne, et pour le schéma que les images sont bien dans `/config/www/`.

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

---

## 12. Utiliser la VMC sans Home Assistant

L'ESP fonctionne **seul** : la régulation, l'antigel, les alertes et la page web tournent dans la carte. Home Assistant ne sert qu'aux historiques, aux automatisations (Éco la nuit) et aux tableaux de bord. On peut donc s'en passer, il faut juste un ordinateur pour la première installation.

### Ce qu'il faut

- Un ordinateur (Windows, Mac ou Linux) avec le navigateur **Chrome** ou **Edge**, et un câble USB pour la carte.
- Les fichiers du dépôt : le `.yaml` de votre carte (KinCony ou DevKit), [`vmc_synoptique.js`](../esphome/vmc_synoptique.js) et [`secrets.example.yaml`](../esphome/secrets.example.yaml).

### Étape 1 : installer ESPHome sur l'ordinateur

Le plus simple est **ESPHome Device Builder**, le même outil que dans Home Assistant, mais sur le PC :

1. Installer **Python 3** (python.org ; sous Windows, cocher « Add Python to PATH »).
2. Ouvrir un terminal (Windows : touche Windows, taper `cmd`) et taper :
   ```
   pip install esphome
   ```
3. Créer un dossier, par exemple `C:\esphome` (ou `~/esphome`), puis lancer :
   ```
   esphome dashboard C:\esphome
   ```
4. Ouvrir **http://localhost:6052** dans le navigateur : c'est l'ESPHome Device Builder.

> Avec Docker : `docker run --rm -p 6052:6052 -v "${PWD}":/config ghcr.io/esphome/esphome` donne le même résultat.

### Étape 2 : préparer les fichiers

1. Dans le dossier `esphome`, copier `vmc_synoptique.js` et le `.yaml` de votre carte (le renommer `vmc.yaml`).
2. Dans le Builder, bouton **Secrets** : remplir le Wi-Fi et une clé `vmc_api_key` (le Builder en génère une à la création d'un appareil ; sans Home Assistant, n'importe quelle clé valide convient).
3. **Validate** sur l'appareil : « Configuration is valid! ».

### Étape 3 : premier flash (USB)

1. Brancher la carte en USB sur l'ordinateur.
2. **Install → Plug into this computer** et choisir le port de la carte.
   - Si le port n'apparaît pas : installer le pilote USB de la carte (CH340 ou CP210x selon le modèle).
   - Autre solution : **Install → Manual download**, puis flasher le fichier `.bin` avec **https://web.esphome.io** (Chrome ou Edge).

### Étape 4 : connexion au Wi-Fi et page web

1. Au démarrage, l'ESP se connecte au Wi-Fi des secrets. S'il n'y arrive pas, il crée le réseau **« VMC double flux »** : voir [Changer de Wi-Fi](#changer-de-wi-fi-wi-fi-de-secours) ci-dessous.
2. Ouvrir **http://vmc.local** (ou l'adresse IP de l'ESP, visible dans la box Internet).
3. Tout se pilote depuis cette page : boutons de mode (Manuel, Éco, Confort, Boost), et ⚙ Configurer pour les vitesses, les consignes, les sondes et l'étalonnage.

### Ce qui change sans Home Assistant

| Fonction | Sans Home Assistant |
|---|---|
| Régulation, antigel, alertes, compteur de filtres | identique (tout tourne dans l'ESP) |
| Page web avec le schéma | identique |
| Heure (dates des remises à zéro) | prise sur Internet (SNTP). Sans Internet, les dates restent « non daté » |
| Page ⚙ Configurer | son interface se charge depuis Internet ; sans Internet, seul le schéma s'affiche |
| Mode Éco automatique la nuit | pas de planning : changer le mode à la main sur la page web |
| Historiques et graphiques | non disponibles |

> Le programme contient `reboot_timeout: 0s` dans `api:` : sans ce réglage, ESPHome redémarre l'ESP toutes les 15 minutes quand aucun Home Assistant ne s'y connecte.

### Mettre à jour sans Home Assistant

1. Relancer le Builder sur le PC (`esphome dashboard C:\esphome`).
2. Remplacer `vmc_synoptique.js` et le `.yaml` par la nouvelle version, en gardant vos secrets.
3. **Install → Wirelessly** : la mise à jour passe par le Wi-Fi, sans câble. Les réglages sont conservés.

### Changer de Wi-Fi (Wi-Fi de secours)

Valable avec ou sans Home Assistant : changement de box, nouveau mot de passe Wi-Fi, déménagement…

1. Si l'ESP ne parvient pas à joindre son Wi-Fi pendant **1 minute**, il crée son propre réseau : **« VMC double flux »**. La perte d'Internet seule ne le déclenche pas : il faut que le Wi-Fi lui-même soit injoignable.
2. Avec un téléphone, se connecter à ce réseau. Mot de passe : **`vmcdoubleflux`** (par défaut, modifiable dans le `.yaml`, bloc `ap:`).
3. Une page s'ouvre toute seule (sinon, ouvrir **http://192.168.4.1**) : choisir le nouveau Wi-Fi, taper son mot de passe, **Enregistrer**.
4. L'ESP redémarre et rejoint le nouveau Wi-Fi. La VMC continue de tourner pendant toute l'opération.

> Le Wi-Fi choisi ici remplace celui des secrets jusqu'au prochain flash. Pensez à mettre aussi à jour `wifi_ssid` et `wifi_password` dans les secrets, pour que la prochaine mise à jour le garde.
