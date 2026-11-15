# Câblage — KinCony KC868-A6

Config : [`esphome/vmc-kincony-a6.yaml`](../esphome/vmc-kincony-a6.yaml)

## Brochage utilisé

| Fonction | Borne KC868-A6 | GPIO / bus |
|---|---|---|
| Moteur **soufflage** 0-10 V (fil jaune) | **DA-1** | GPIO26 (DAC + LM258) |
| Moteur **extraction** 0-10 V (fil jaune) | **DA-2** | GPIO25 (DAC + LM258) |
| GND des moteurs (fils bleus) | GND à côté de DA-1/DA-2 | — |
| Capteur de pression Huba, signal (jaune) | **A1** (entrée 0-5 V) | GPIO36 |
| Huba GND (vert) | GND | — |
| Huba +12 V (bleu) | +12 V de l'alimentation de la carte | — |
| Sondes DS18B20 (DATA) | **IO-1** | GPIO32 (1-Wire) |
| Relais 1 : coupure moteur soufflage | sortie 1 | PCF8574 0x24, broche 0 |
| Relais 2 : coupure moteur extraction | sortie 2 | PCF8574 0x24, broche 1 |
| Relais 3 : by-pass | sortie 3 | PCF8574 0x24, broche 2 |
| I²C | — | SDA GPIO4, SCL GPIO15 |
| Alimentation | +12 V / GND | 12 V DC, 1 A minimum |

## Moteurs EC (ebm-papst R3G140)

- **Jaune** = entrée 0-10 V, **bleu** = GND de commande, **rouge** = sortie +10 V **non utilisée** (à isoler).
- Retirer toute résistance de tirage rouge→jaune ajoutée pour la version DevKit.
- **Relais de coupure** : COM = arrivée de phase L, **NC** = départ vers le moteur. Relais au repos = moteur alimenté. Si la carte tombe en panne, la ventilation continue.

## By-pass (actionneur 230 V à rappel par ressort)

- COM = phase L, **NO** = fil de phase de l'actionneur, neutre en direct.
- Relais activé = actionneur alimenté = by-pass **ouvert**. Hors tension, le ressort le referme.
- Mode « Forcé fermé » par défaut. Tester en « Forcé ouvert », puis passer en « Automatique ».

## Réglages après le flash

- `dac_echelle` : mesurer DA-1 à 100 %. Si on lit par exemple 10,4 V, mettre 10 / 10,4 = `0.96`.
- `ai_echelle` : comparer « Capteur pression – tension » avec la mesure au multimètre sur le fil jaune du Huba, et ajuster.
- **Affectation des sondes** : section « Sondes – affectation ». Chauffer chaque sonde entre les doigts et choisir le bon rôle.

## À vérifier à réception

- Facteur exact de l'entrée analogique (d'où `ai_echelle`).
- Présence d'une résistance de tirage sur IO-1. Si les logs affichent « Found no devices », vérifier la tension de la borne d'alimentation des capteurs avant d'ajouter une résistance de 4,7 kΩ.
