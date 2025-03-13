console.log("popup.js loaded");

// Generate a random first name
function generateFirstName() {
  const firstNames = ["Alice", "Bob", "Charlie", "David", "Eve"];
  return firstNames[Math.floor(Math.random() * firstNames.length)];
}

// Generate a random last name
function generateLastName() {
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones"];
  return lastNames[Math.floor(Math.random() * lastNames.length)];
}

// Generate a random birthdate (18 to 100 years old)
function generateBirthdate() {
  const today = new Date();
  const minAge = 18;
  const maxAge = 100;
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;

  const birthYear = today.getFullYear() - age;
  const birthMonthIndex = Math.floor(Math.random() * 12);
  const birthDay = Math.floor(Math.random() * 28) + 1;

  const birthdate = new Date(birthYear, birthMonthIndex, birthDay);

  const day = birthdate.getDate();
  const monthName = birthdate.toLocaleString('en-US', { month: 'long' });
  const year = birthdate.getFullYear();

  return `${day} ${monthName} ${year}`;
}

// Generate a random gender
function generateGenre() {
  const genres = ["Female", "Male"];
  return genres[Math.floor(Math.random() * genres.length)];
}

// Initialize fields with random values
function initializeFields() {
  document.getElementById('firstName').value = generateFirstName();
  document.getElementById('lastName').value = generateLastName();
  document.getElementById('birthdate').value = generateBirthdate();
  document.getElementById('genre').value = generateGenre();
}

// Generate buttons
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

// Copy buttons
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

// Copy to clipboard
function copyToClipboard(elementId) {
  const text = document.getElementById(elementId).value;
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied: ' + text);
  }).catch(err => {
    console.error("Error copying text:", err);
  });
}

// Send data to content script
document.getElementById('fillForm').addEventListener('click', () => {
  const userData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    birthdate: document.getElementById('birthdate').value,
    genre: document.getElementById('genre').value
  };
  console.log("User data to send:", userData);

  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    browser.tabs.sendMessage(tabs[0].id, { action: "fillForm", data: userData })
      .then(() => console.log("Message sent to content script"))
      .catch(err => console.error("Error sending message:", err));
  });
});

// On popup load
window.addEventListener('load', () => {
  initializeFields();
});
