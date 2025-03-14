console.log("popup.js loaded");

// Example arrays of random data
const firstNames = ["Alice", "Bob", "Charlie", "David", "Eve"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones"];
const countries = ["USA", "Canada", "UK", "France", "Germany", "Japan", "Brazil"];
const cities = ["New York", "London", "Paris", "Tokyo", "Berlin", "Montreal", "San Francisco"];
const streets = [
  "123 Main St",
  "456 Elm Avenue",
  "789 Maple Lane",
  "1010 Pine Road",
  "222 Oak Boulevard"
];

// Generate random first name
function generateFirstName() {
  return firstNames[Math.floor(Math.random() * firstNames.length)];
}

// Generate random last name
function generateLastName() {
  return lastNames[Math.floor(Math.random() * lastNames.length)];
}

// Generate random birthdate (21 to 100 years old)
function generateBirthdate() {
  const today = new Date();
  const minAge = 21;
  const maxAge = 100;
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;

  const birthYear = today.getFullYear() - age;
  const birthMonthIndex = Math.floor(Math.random() * 12);
  const birthDay = Math.floor(Math.random() * 28) + 1;

  const birthdateObj = new Date(birthYear, birthMonthIndex, birthDay);
  const day = birthdateObj.getDate();
  const monthName = birthdateObj.toLocaleString("en-US", { month: "long" });
  const year = birthdateObj.getFullYear();

  return `${day} ${monthName} ${year}`;
}

// Generate random gender
function generateGenre() {
  const genres = ["Female", "Male"];
  return genres[Math.floor(Math.random() * genres.length)];
}

// Generate random country
function generateCountry() {
  return countries[Math.floor(Math.random() * countries.length)];
}

// Generate random city
function generateCity() {
  return cities[Math.floor(Math.random() * cities.length)];
}

// Generate random street address
function generateStreet() {
  return streets[Math.floor(Math.random() * streets.length)];
}

// Initialize the fields in popup with random data
function initializeFields() {
  document.getElementById("firstName").value = generateFirstName();
  document.getElementById("lastName").value = generateLastName();
  document.getElementById("birthdate").value = generateBirthdate();
  document.getElementById("genre").value = generateGenre();

  document.getElementById("country").value = generateCountry();
  // Fixing the "ctiy" id -> assume we meant "city"
  const cityElem = document.getElementById("city") || document.getElementById("ctiy");
  if (cityElem) {
    cityElem.value = generateCity();
  }
  document.getElementById("street").value = generateStreet();
}

// --- Generate button handlers ---
document.getElementById("generateFirstName").addEventListener("click", () => {
  document.getElementById("firstName").value = generateFirstName();
});
document.getElementById("generateLastName").addEventListener("click", () => {
  document.getElementById("lastName").value = generateLastName();
});
document.getElementById("generateBirthdate").addEventListener("click", () => {
  document.getElementById("birthdate").value = generateBirthdate();
});
document.getElementById("generateGenre").addEventListener("click", () => {
  document.getElementById("genre").value = generateGenre();
});
document.getElementById("generateCountry").addEventListener("click", () => {
  document.getElementById("country").value = generateCountry();
});
document.getElementById("generateCity").addEventListener("click", () => {
  // Make sure we handle the "city" vs "ctiy" ID
  const cityElem = document.getElementById("city") || document.getElementById("ctiy");
  if (cityElem) {
    cityElem.value = generateCity();
  }
});
document.getElementById("generateStreet").addEventListener("click", () => {
  document.getElementById("street").value = generateStreet();
});

// --- Copy button handlers ---
document.getElementById("copyFirstName").addEventListener("click", () => {
  copyToClipboard("firstName");
});
document.getElementById("copyLastName").addEventListener("click", () => {
  copyToClipboard("lastName");
});
document.getElementById("copyBirthdate").addEventListener("click", () => {
  copyToClipboard("birthdate");
});
document.getElementById("copyGenre").addEventListener("click", () => {
  copyToClipboard("genre");
});
document.getElementById("copyCountry").addEventListener("click", () => {
  copyToClipboard("country");
});
document.getElementById("copyCity").addEventListener("click", () => {
  const cityElem = document.getElementById("city") || document.getElementById("ctiy");
  if (cityElem) {
    copyToClipboard(cityElem.id);
  }
});
document.getElementById("copyStreet").addEventListener("click", () => {
  copyToClipboard("street");
});

// Copy to clipboard
function copyToClipboard(elementId) {
  const elem = document.getElementById(elementId);
  if (!elem) return;
  const text = elem.value;
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied: " + text);
  }).catch(err => {
    console.error("Error copying text:", err);
  });
}

// "Fill" form => send data to content script
document.getElementById("fillForm").addEventListener("click", () => {
  const cityElem = document.getElementById("city") || document.getElementById("ctiy");

  const userData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    birthdate: document.getElementById("birthdate").value,
    genre: document.getElementById("genre").value,
    country: document.getElementById("country").value,
    city: cityElem ? cityElem.value : "",
    street: document.getElementById("street").value
  };
  console.log("User data to send:", userData);

  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    browser.tabs.sendMessage(tabs[0].id, { action: "fillForm", data: userData })
      .then(() => console.log("Message sent to content script"))
      .catch(err => console.error("Error sending message:", err));
  });
});

// On popup load
window.addEventListener("load", () => {
  initializeFields();
});
