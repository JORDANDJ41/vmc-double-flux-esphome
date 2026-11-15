# Retour d'expérience — pièges rencontrés

## Moteur EC dont l'entrée 0-10 V a été détruite

- **Symptôme** : le moteur tourne en permanence à plein régime, même avec le fil jaune relié au bleu, alors qu'un moteur identique s'arrête quand on débranche le jaune.
- **Mesure** : sortie rouge/bleu à **4 V au lieu de 10 V**. L'alimentation interne isolée de l'interface est abîmée. Faute de consigne valide, le moteur passe au maximum par sécurité.
- **Cause probable** : premier montage avec le **+10 V (rouge) sur le collecteur** et l'émetteur directement à la masse, commandé en PWM. Résultat : un court-circuit répété de la sortie +10 V. Le courant de défaut boucle dans l'électronique du moteur, pas dans l'ESP.
- **Leçon** : ne jamais court-circuiter la sortie +10 V. Utiliser une sortie 0-10 V active (KinCony) ou, à défaut, une résistance de tirage suffisante.

## Le moteur « ne descend pas » en vitesse

Une résistance de tirage rouge→jaune trop faible empêche le transistor de faire descendre le jaune. Voir la règle « tirage ≥ 4 × résistance d'émetteur » dans `cablage-esp32-devkit.md`.

## Pression qui ne bouge pas avec le soufflage

Sur cette machine, le capteur Huba mesure en réalité **le réseau d'extraction**. La régulation d'origine travaillait à pression constante côté extraction, avec des bouches hygro. Avec l'extraction bloquée à fond, la pression reste à peu près fixe.

## Reprise trop froide

- **Dépression forte** (extraction à fond, soufflage réduit) : de l'air froid entre par les fuites du réseau d'extraction dans les combles. Augmenter le soufflage **a fait remonter la reprise** de plusieurs degrés.
- **Siphon de condensats vide** : il crée une prise d'air directe sous plus de 200 Pa de dépression. Garde d'eau d'au moins 1 mm par 10 Pa de dépression (viser 50-80 mm), isoler le siphon contre le gel, le remplir à chaque automne, ou utiliser un siphon sec à membrane.
- **Sondes hors du flux** : elles lisent la température des parois froides du caisson.
- Gaines peu isolées : les enfouir sous l'isolant, isoler les coudes, les raccords et le caisson.

## Page web : script non chargé

- Avec `local: true`, la page intégrée **ignore `js_include`**. Ne pas mettre `local: true`.
- Le `.js` est servi **sans jeu de caractères** : écrire le fichier **en ASCII uniquement** (accents codés en `é`). Sinon, une expression régulière devient invalide et tout le script s'arrête.
