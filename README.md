# FakeInfo-Filler

**FakeInfo-Filler** est une extension Chrome/Firefox permettant de générer et remplir automatiquement des champs de formulaire avec des fausses informations réalistes pour faciliter le **debug**, les **tests d'interface** ou les **démonstrations**.

> Cette extension est pensée pour les développeurs web, QA et curieux qui veulent rapidement remplir des formulaires sans utiliser leurs vraies données.

---

## ✨ Fonctionnalités

✅ Remplit automatiquement les champs standards : prénom, nom, date de naissance, genre, pays, ville, rue.  
✅ Simulation réaliste de frappe clavier (pas de simple assignation `.value`).  
✅ Menu contextuel accessible par clic droit pour remplir un champ ou tous les champs.  
✅ Popup avec génération aléatoire de fausses données et possibilité de les copier.  
✅ Prise en charge des formulaires variés (placeholders, IDs, aria-labels, etc).  
✅ Détection intelligente du type de champ à remplir.  

---

## 🗂️ Structure du projet

```
loocist23-fakeinfo-filler/
├── background.js      # Gestion du menu contextuel
├── content.js         # Logique de remplissage intelligent des champs
├── manifest.json      # Déclaration de l'extension
├── popup.html         # Interface popup utilisateur
├── popup.js           # Logique de génération de données dans le popup
├── styles.css         # Styles du popup
```

---

## 🔧 Installation manuelle

1. Clone ce dépôt :

```bash
git clone https://github.com/loocist23/fakeinfo-filler.git
```

2. Ouvre ton navigateur Chrome ou Firefox.

3. Accède à la page d'extensions :
   - **Chrome** : `chrome://extensions`
   - **Firefox** : `about:debugging#/runtime/this-firefox`

4. Active le **Mode développeur**.

5. Clique sur **Charger l'extension non empaquetée** (Chrome) ou **Charger un module complémentaire temporaire** (Firefox).

6. Sélectionne le dossier `loocist23-fakeinfo-filler`.

---

## 🖱️ Utilisation

### Depuis le Popup
- Clique sur l'icône de l'extension.
- Génère des données aléatoires pour chaque champ.
- Copie facilement les données avec le bouton **Copy**.
- Clique sur **Fill** pour remplir automatiquement le formulaire actif avec ces données.

### Depuis le clic droit
- Clique droit sur un champ éditable : option **Fill This Input**.
- Clique droit ailleurs : option **Fill All Inputs**.

---

## 🧑‍💻 Technologies utilisées

- **JavaScript Vanilla**
- **HTML/CSS**
- API WebExtension (`chrome.*` et `browser.*`)
- Simulation d'événements clavier pour un comportement réaliste

---

## ⚠️ Avertissement

Cette extension est uniquement destinée à un usage personnel et de développement. **Ne l'utilisez jamais pour injecter des données sur des sites en production sans autorisation.**

---

## 📄 Licence

Projet libre sous [MIT License](https://opensource.org/licenses/MIT).

---

**Fait avec ❤️ par [Loocist23](https://github.com/Loocist23)**
