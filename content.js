console.log("content.js loaded");

// ====== Random data arrays and generators ======
const firstNames = ["Alice", "Bob", "Charlie", "David", "Eve", "Fiona", "George"];
const lastNames = ["Smith", "Johnson", "Brown", "Taylor", "Williams", "Jones", "Garcia"];
const possibleGenders = ["male", "female"];

function getRandomFirstName() {
  return firstNames[Math.floor(Math.random() * firstNames.length)];
}

function getRandomLastName() {
  return lastNames[Math.floor(Math.random() * lastNames.length)];
}

function getRandomBirthdate() {
  const today = new Date();
  const minAge = 18;
  const maxAge = 80;
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  const birthYear = today.getFullYear() - age;
  const birthMonthIndex = Math.floor(Math.random() * 12);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = monthNames[birthMonthIndex];
  const birthDay = Math.floor(Math.random() * 28) + 1;
  return `${birthDay} ${monthName} ${birthYear}`;
}

function getRandomGender() {
  return possibleGenders[Math.floor(Math.random() * possibleGenders.length)];
}

// ====== Simulate typing ======
async function simulateUserTyping(element, text, delay = 50) {
  return new Promise((resolve) => {
    element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    element.focus();
    element.value = "";

    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        const char = text[i];
        element.dispatchEvent(new KeyboardEvent("keydown", { key: char, bubbles: true, cancelable: true }));
        element.dispatchEvent(new KeyboardEvent("keypress", { key: char, bubbles: true, cancelable: true }));

        element.value += char;

        element.dispatchEvent(new InputEvent("input", {
          data: char,
          bubbles: true,
          cancelable: false,
          inputType: "insertText"
        }));
        element.dispatchEvent(new KeyboardEvent("keyup", { key: char, bubbles: true, cancelable: true }));
        i++;
      } else {
        clearInterval(intervalId);

        element.blur();
        element.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
        element.dispatchEvent(new FocusEvent("focusout", { bubbles: true, cancelable: true }));
        resolve();
      }
    }, delay);
  });
}

// Listen for messages from the popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fillForm") {
    fillFormWithData(message.data);
  }
});

// ====== Utility for birthdate "Month" => numeric ======
const monthToNumber = {
  January: "1", February: "2", March: "3", April: "4",
  May: "5", June: "6", July: "7", August: "8",
  September: "9", October: "10", November: "11", December: "12"
};

/** Convert "12 March 1987" => "1987-03-12" for <input type="date"> */
function toDateInputValue(day, month, year) {
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

// ====== Sub-functions for standard fields ======
async function fillFirstNameField(firstName) {
  const selector = `
    input[name*="firstname" i],
    input[name*="first_name" i],
    input[name*="given" i],
    input[placeholder*="prenom" i],
    input[placeholder*="first name" i],
    input[placeholder*="given name" i],
    input[name*="firstnameinput" i]
  `.replace(/\s+/g, ' ');

  const field = document.querySelector(selector);
  if (field) {
    await simulateUserTyping(field, firstName, 50);
  }
}

async function fillLastNameField(lastName) {
  const selector = `
    input[name*="lastname" i],
    input[name*="last_name" i],
    input[name*="family" i],
    input[name*="surname" i],
    input[placeholder*="last name" i],
    input[placeholder*="family name" i],
    input[placeholder*="surname" i],
    input[placeholder*="nom de famille" i],
    input[name*="lasttnameinput" i]
  `.replace(/\s+/g, ' ');

  const field = document.querySelector(selector);
  if (field) {
    await simulateUserTyping(field, lastName, 50);
  }
}

async function fillFullNameField(fullName) {
  const selector = `
    input[name="name"],
    input[name*="fullname" i],
    input[name*="full_name" i],
    input[name*="complete" i],
    input[name*="your_name" i],
    input[name*="votre_nom" i],
    input[placeholder*="full name" i],
    input[placeholder*="fullname" i],
    input[placeholder*="complete name" i],
    input[placeholder*="your name" i],
    input[placeholder*="nom complet" i]
  `.replace(/\s+/g, ' ');

  const field = document.querySelector(selector);
  if (field) {
    await simulateUserTyping(field, fullName, 50);
  }
}

async function fillBirthdateField(birthdate) {
  const parts = birthdate.split(" ");
  if (parts.length !== 3) return;

  const [rawDay, rawMonth, rawYear] = parts;
  const numericMonth = monthToNumber[rawMonth] || "";

  // Facebook style day/month/year
  const fbDay = document.querySelector('select[name="birthday_day"]');
  const fbMonth = document.querySelector('select[name="birthday_month"]');
  const fbYear = document.querySelector('select[name="birthday_year"]');
  if (fbDay && fbMonth && fbYear) {
    fbDay.value = rawDay;
    fbMonth.value = numericMonth;
    fbYear.value = rawYear;
    return;
  }

  // <input type="date">
  const dateInputSelector = `
    input[type="date"],
    input[id*="birthdate" i],
    input[name*="dob" i],
    input[name*="birth" i],
    input[placeholder*="birth date" i],
    input[placeholder*="date of birth" i],
    input[placeholder*="birthday" i]
  `.replace(/\s+/g, ' ');

  let dateInput = document.querySelector(dateInputSelector);

  if (dateInput && dateInput.type === "date") {
    dateInput.value = toDateInputValue(rawDay, numericMonth, rawYear);
    return;
  } else if (dateInput && dateInput.tagName.toLowerCase() === "input") {
    const typedDate = `${rawDay}/${numericMonth}/${rawYear}`;
    await simulateUserTyping(dateInput, typedDate, 50);
    return;
  }

  // fallback => separate day/month/year
  let monthSel = document.querySelector("#SELECTOR_1")
    || document.querySelector("#month")
    || document.querySelector("#BirthMonth")
    || document.querySelector('select[name*="month" i], select[name="BirthMonth"]');
  if (monthSel && monthSel.tagName.toLowerCase() === "select") {
    monthSel.value = numericMonth;
  } else {
    let monthInput = document.querySelector('input[name*="month" i]');
    if (monthInput) {
      await simulateUserTyping(monthInput, numericMonth);
    }
  }

  let daySel = document.querySelector("#SELECTOR_2")
    || document.querySelector("#day")
    || document.querySelector("#BirthDay")
    || document.querySelector('select[name*="day" i], select[name="BirthDay"]');
  if (daySel && daySel.tagName.toLowerCase() === "select") {
    daySel.value = rawDay;
  } else if (daySel && daySel.tagName.toLowerCase() === "input") {
    await simulateUserTyping(daySel, rawDay);
  } else {
    let dayInput = document.querySelector('input[name*="day" i]');
    if (dayInput) {
      await simulateUserTyping(dayInput, rawDay);
    }
  }

  let yearSel = document.querySelector("#SELECTOR_3")
    || document.querySelector("#year")
    || document.querySelector("#BirthYear")
    || document.querySelector('select[name*="year" i], select[name="BirthYear"]');
  if (yearSel && yearSel.tagName.toLowerCase() === "select") {
    yearSel.value = rawYear;
  } else if (yearSel && yearSel.tagName.toLowerCase() === "input") {
    await simulateUserTyping(yearSel, rawYear);
  } else {
    let yearInput = document.querySelector('input[name*="year" i]');
    if (yearInput) {
      await simulateUserTyping(yearInput, rawYear);
    }
  }
}

function fillGenderField(genre) {
  const lowerGenre = genre.toLowerCase().trim();

  const genderSelect = document.querySelector('#gender, select[name="gender"], select[name*="gender" i]');
  if (genderSelect) {
    // 1 => male, 2 => female, 3 => other
    if (lowerGenre === "female") {
      genderSelect.value = "2";
      return;
    } else if (lowerGenre === "male") {
      genderSelect.value = "1";
      return;
    } else {
      genderSelect.value = "3";
      return;
    }
  }

  if (lowerGenre === "female") {
    let femaleRadio = document.querySelector('input[id*="female" i], input[id*="woman" i]');
    if (!femaleRadio) {
      femaleRadio = document.querySelector(
        'input[name*="female" i], input[name*="woman" i], ' +
        'input[name="sex"][value="1"], input[name="gender"][value="female"], ' +
        'input[name="gender"][value="woman"]'
      );
    }
    if (femaleRadio) {
      femaleRadio.checked = true;
      return;
    }
  }

  if (lowerGenre === "male") {
    let maleRadio = document.querySelector('input[id*="male" i], input[id*="man" i]');
    if (!maleRadio) {
      maleRadio = document.querySelector(
        'input[name*="male" i], input[name*="man" i], ' +
        'input[name="sex"][value="2"], input[name="gender"][value="male"], ' +
        'input[name="gender"][value="man"]'
      );
    }
    if (maleRadio) {
      maleRadio.checked = true;
      return;
    }
  }

  // fallback => "other"
  let otherRadio = document.querySelector(
    'input[name="sex"][value="-1"], ' +
    'input[name="gender"][value="other"], ' +
    'input[name="gender"][value="prefer"], ' +
    'input[name="gender"][value="custom"], ' +
    'input[name="gender"][value="nonbinary"]'
  );
  if (!otherRadio) {
    otherRadio = document.querySelector(
      'input[id*="other" i], input[name*="other" i], ' +
      'input[id*="custom" i], input[name*="custom" i]'
    );
  }
  if (otherRadio) {
    otherRadio.checked = true;
  }
}

// ----- NEW: fillCountryField, fillCityField, fillStreetField -----

async function fillCountryField(country) {
  // 1) Attempt direct name or placeholder approach
  const selector = `
    select[name*="country" i],
    select[id*="country" i],
    input[name*="country" i],
    input[id*="country" i],
    input[placeholder*="country" i]
  `.replace(/\s+/g, ' ');

  let field = document.querySelector(selector);
  if (field) {
    if (field.tagName.toLowerCase() === "select") {
      // set option matching text
      setCountrySelectOption(field, country);
    } else {
      // it's an <input>, simulate typing
      await simulateUserTyping(field, country, 50);
    }
    return;
  }

  // 2) If no name/id, try scanning all SELECT elements with known country options
  const allSelects = document.querySelectorAll("select");
  for (const sel of allSelects) {
    // Does this select contain "USA," "UK," "Germany," etc.?
    const countryOptions = Array.from(sel.options).map(opt => opt.textContent.trim().toLowerCase());
    if (countryOptions.includes("usa") || countryOptions.includes("uk") ||
      countryOptions.includes("germany") || countryOptions.includes("japan") ||
      countryOptions.includes("canada") || countryOptions.includes("france") ||
      countryOptions.includes("brazil")) {
      // We consider this select as "country"
      setCountrySelectOption(sel, country);
      return;
    }
  }
}

/**
 * setCountrySelectOption(selectElem, countryText):
 * If there's an option whose .textContent matches 'countryText' (case-insensitive),
 * we set selectElem.value = that option's .value.
 */
function setCountrySelectOption(selectElem, countryText) {
  const countryLower = countryText.toLowerCase();
  const match = Array.from(selectElem.options).find(opt =>
    opt.textContent.trim().toLowerCase() === countryLower
  );
  if (match) {
    selectElem.value = match.value; // set to the <option>'s value
  } else {
    // fallback: pick the first non-hidden option
    for (const opt of selectElem.options) {
      if (!opt.hidden) {
        selectElem.value = opt.value;
        break;
      }
    }
  }
}


async function fillCityField(city) {
  const selector = `
    input[name*="city" i],
    input[id*="city" i],
    input[placeholder*="city" i]
  `.replace(/\s+/g, ' ');

  const field = document.querySelector(selector);
  if (field) {
    await simulateUserTyping(field, city, 50);
  }
}

async function fillStreetField(street) {
  const selector = `
    input[name*="street" i],
    input[id*="street" i],
    input[name*="address" i],
    input[id*="address" i],
    input[placeholder*="street" i],
    input[placeholder*="address" i]
  `.replace(/\s+/g, ' ');

  const field = document.querySelector(selector);
  if (field) {
    await simulateUserTyping(field, street, 50);
  }
}


// ============ "detectFieldType" for fillOneFieldIntelligent logic ==============
function detectFieldType(elem) {
  const nameLower = (elem.name || "").toLowerCase();
  const placeholderLower = (elem.placeholder || "").toLowerCase();

  // If it's a radio or select, might guess gender
  if ((elem.type || "").toLowerCase() === "radio" && nameLower.includes("gender")) {
    return "gender";
  }
  // If it's a SELECT with some known country options (like "USA","UK","Germany","Japan"):
  if (elem.tagName.toLowerCase() === "select") {
    // if we already detect name or id includes "country" => return "country"
    if (nameLower.includes("country") || idLower.includes("country")) {
      return "country";
    }
    // else, we check its <option> text
    const countryOptions = ["usa", "uk", "germany", "japan", "canada", "france", "brazil"];
    const selectHasCountries = Array.from(elem.options).some(opt => {
      return countryOptions.includes(opt.textContent.trim().toLowerCase());
    });
    if (selectHasCountries) {
      return "country";
    }
  }

  // continue your standard checks ...
  if (nameLower.includes("city") || placeholderLower.includes("city") || idLower.includes("city")) {
    return "city";
  }

  // "street" or "address"
  if (nameLower.includes("street") || nameLower.includes("address") || placeholderLower.includes("street") || placeholderLower.includes("address")) {
    return "street";
  }

  // first name
  if (nameLower.includes("first") || placeholderLower.includes("first name") || placeholderLower.includes("given name") || placeholderLower.includes("prénom")) {
    return "firstname";
  }

  // last name
  if (nameLower.includes("last") || nameLower.includes("family") || nameLower.includes("surname") ||
    placeholderLower.includes("last name") || placeholderLower.includes("family name") ||
    placeholderLower.includes("surname") || placeholderLower.includes("nom de famille")) {
    return "lastname";
  }

  // birth date
  if ((elem.type || "").toLowerCase() === "date"
    || nameLower.includes("birth") || nameLower.includes("date")
    || placeholderLower.includes("birth date") || placeholderLower.includes("date of birth") ||
    placeholderLower.includes("birthday")) {
    return "birthdate";
  }

  // gender
  if (nameLower.includes("gender") || placeholderLower.includes("gender")) {
    return "gender";
  }

  // fallback => "fullname"
  return "fullname";
}

// ============ fillFormWithData for the "fillForm" action from popup ===========
async function fillFormWithData(data) {
  console.log("Received data:", data);

  // data: { firstName, lastName, birthdate, genre, country, city, street }
  await fillFirstNameField(data.firstName);
  await fillLastNameField(data.lastName);
  await fillFullNameField(data.lastName + " " + data.firstName);
  await fillBirthdateField(data.birthdate);
  fillGenderField(data.genre);

  // fill newly added fields
  if (data.country) {
    await fillCountryField(data.country);
  }
  if (data.city) {
    await fillCityField(data.city);
  }
  if (data.street) {
    await fillStreetField(data.street);
  }

  console.log("Form potentially filled with sub-functions.");
}

// ============ 3) Context menu logic =============
let lastRightClickedElement = null;

document.addEventListener("contextmenu", (e) => {
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement ||
    e.target.isContentEditable
  ) {
    lastRightClickedElement = e.target;
  } else {
    lastRightClickedElement = null;
  }
});

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "fillOneInput") {
    if (lastRightClickedElement) {
      fillOneFieldIntelligent(lastRightClickedElement);
    }
  } else if (msg.action === "fillAllInputs") {
    fillAllFieldsIntelligent();
  }
});

async function fillOneFieldIntelligent(elem) {
  const fieldType = detectFieldType(elem);
  console.log("Detected field type (single):", fieldType);

  switch (fieldType) {
    case "firstname":
      await fillFirstNameField(getRandomFirstName());
      break;
    case "lastname":
      await fillLastNameField(getRandomLastName());
      break;
    case "birthdate":
      await fillBirthdateField(getRandomBirthdate());
      break;
    case "gender":
      fillGenderField(getRandomGender());
      break;
    case "country":
      await fillCountryField("USA");
      break;
    case "city":
      await fillCityField("London");
      break;
    case "street":
      await fillStreetField("123 Main St");
      break;
    default:
      // 'fullname'
      await fillFullNameField(`${getRandomFirstName()} ${getRandomLastName()}`);
      break;
  }
}

async function fillAllFieldsIntelligent() {
  // We include radio, date, select, etc.
  const fields = document.querySelectorAll('input, select, textarea');

  for (const field of fields) {
    const fieldType = detectFieldType(field);
    console.log("Detected field type (all):", fieldType);

    switch (fieldType) {
      case "firstname":
        await fillFirstNameField(getRandomFirstName());
        break;
      case "lastname":
        await fillLastNameField(getRandomLastName());
        break;
      case "birthdate":
        await fillBirthdateField(getRandomBirthdate());
        break;
      case "gender":
        fillGenderField(getRandomGender());
        break;
      case "country":
        await fillCountryField("Germany");
        break;
      case "city":
        await fillCityField("Tokyo");
        break;
      case "street":
        await fillStreetField("456 Elm Avenue");
        break;
      default:
        await fillFullNameField(`${getRandomFirstName()} ${getRandomLastName()}`);
        break;
    }
  }
}
