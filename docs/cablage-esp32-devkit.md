# Câblage — ESP32 DevKit + platine à trous (version de transition)

Config : [`esphome/vmc-esp32-devkit.yaml`](../esphome/vmc-esp32-devkit.yaml)

> Cette version garde la carte d'origine, uniquement pour alimenter le Huba en 12 V, et pilote les moteurs avec un étage à transistor. Elle fonctionne, mais elle est plus fragile que la KinCony. Lisez [`retour-d-experience.md`](retour-d-experience.md) avant de vous lancer.

## Schéma de principe

- **Sondes DS18B20** : DATA sur GPIO4, résistance de tirage de **4,7 kΩ** vers le 3V3. Alimentation 3V3 / GND.
- **Huba** (0,5-4,5 V) : signal → **pont diviseur ÷4** (3 × 4,7 kΩ en série en haut, 4,7 kΩ en bas) → GPIO34. **Le GND du Huba doit être commun** à la carte d'origine **et** à l'ESP. Le +12 V (bleu) ne va **jamais** sur l'ESP.
- **Commande d'un moteur** (× 2) :
  - GPIO25 (soufflage) ou GPIO26 (extraction) → **4,7 kΩ** → base du 2N2222 ;
  - émetteur → **2,2 kΩ** → GND (= fil bleu du moteur) ;
  - collecteur → **fil jaune** du moteur ;
  - **résistance de tirage 9,1 kΩ** entre le **rouge (+10 V)** et le **jaune**, côté moteur (dans un WAGO).
  - Le transistor « tire » le jaune vers 0 V contre cette résistance. Le programme calcule la tension DAC pour obtenir 10 % = 1 V … 100 % = environ 9,2 V.
  - La résistance de tirage doit faire **au moins environ 4 fois** la résistance d'émetteur. Avec une résistance de tirage trop faible (par exemple 120 Ω ou 1 kΩ), le moteur ne descend jamais sous sa vitesse haute.

## Plan d'implantation

- [`images/plan_plaque_composants.png`](images/plan_plaque_composants.png) : vue côté composants.
- [`images/plan_plaque_soudure.png`](images/plan_plaque_soudure.png) : vue côté soudure.

Le plan a été dessiné pour un DevKit à **15 broches par côté**. Avec un DevKit USB-C à **16 broches par côté** (EN … 36, 39, 34 … VIN, 5V, GND d'un côté), barrettes en rangées 03 à 18, les broches deviennent :

| Repère | Broche | | Repère | Broche |
|---|---|---|---|---|
| J06 | GPIO34 | | A13 | GPIO4 |
| J10 | GPIO25 | | A17 | 3V3 |
| J11 | GPIO26 | | A18 / J18 | GND |
| J16 | **VIN** ⚠️ | | J17 | **5V** ⚠️ |

**Vérifier au multimètre avant la première mise sous tension** : pas de court-circuit 3V3–GND ni VIN/5V–GND, et environ 4,7 kΩ entre GPIO4 et 3V3.
