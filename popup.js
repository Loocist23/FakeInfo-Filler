console.log("popup.js chargé");

// Fonction pour générer un prénom aléatoire
function generateFirstName() {
  const firstNames = ["Alice", "Bob", "Charlie", "David", "Eve"];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  return firstName;
}

// Fonction pour générer un nom aléatoire
function generateLastName() {
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones"];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return lastName;
}

// Fonction pour générer une date de naissance (18 à 100 ans)
function generateBirthdate() {
  const today = new Date();
  const minAge = 18;
  const maxAge = 100;
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;

  // On prend l'année courante - age
  const birthYear = today.getFullYear() - age;
  // Mois aléatoire (0 à 11)
  const birthMonthIndex = Math.floor(Math.random() * 12);
  // Jour aléatoire (1 à 28)
  const birthDay = Math.floor(Math.random() * 28) + 1;

  const birthdate = new Date(birthYear, birthMonthIndex, birthDay);

  // Exemple: 12 March 1987
  const day = birthdate.getDate(); // ex: 12
  const monthName = birthdate.toLocaleString('en-US', { month: 'long' });
  const year = birthdate.getFullYear(); // ex: 1987

  return `${day} ${monthName} ${year}`;
}

// Fonction pour générer un genre aléatoire
function generateGenre() {
  const genres = ["Female", "Male"];
  return genres[Math.floor(Math.random() * genres.length)];
}

// Initialise la popup avec des valeurs aléatoires
function initializeFields() {
  document.getElementById('firstName').value = generateFirstName();
  document.getElementById('lastName').value = generateLastName();
  document.getElementById('birthdate').value = generateBirthdate();
  document.getElementById('genre').value = generateGenre();
}

// --- Listeners des boutons "Générer" ---
document.getElementById('generateFirstName').addEventListener('click', () => {
  document.getElementById('firstName').value = generateFirstName();
});

document.getElementById('generateLastName').addEventListener('click', () => {
  document.getElementById('lastName').value = generateLastName();
});

document.getElementById('generateBirthdate').addEventListener('click', () => {
  document.getElementById('birthdate').value = generateBirthdate();
});

document.getElementById('generateGenre').addEventListener('click', () => {
  document.getElementById('genre').value = generateGenre();
});

// --- Listeners des boutons "Copier" ---
document.getElementById('copyFirstName').addEventListener('click', () => {
  copyToClipboard('firstName');
});
document.getElementById('copyLastName').addEventListener('click', () => {
  copyToClipboard('lastName');
});
document.getElementById('copyBirthdate').addEventListener('click', () => {
  copyToClipboard('birthdate');
});
document.getElementById('copyGenre').addEventListener('click', () => {
  copyToClipboard('genre');
});

// Copie dans le presse-papiers
function copyToClipboard(elementId) {
  const text = document.getElementById(elementId).value;
  navigator.clipboard.writeText(text).then(() => {
    alert('Copié : ' + text);
  }).catch(err => {
    console.error("Erreur lors de la copie :", err);
  });
}

// Envoi des données au script de contenu
document.getElementById('fillForm').addEventListener('click', () => {
  const userData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    birthdate: document.getElementById('birthdate').value,
    genre: document.getElementById('genre').value
  };
  console.log("Données utilisateur à envoyer :", userData);
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    browser.tabs.sendMessage(tabs[0].id, { action: "fillForm", data: userData })
      .then(() => console.log("Message envoyé au script de contenu"))
      .catch(err => console.error("Erreur lors de l'envoi du message :", err));
  });
});

// Au chargement de la popup
window.addEventListener('load', () => {
  initializeFields();
});
