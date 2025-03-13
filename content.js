console.log("content.js loaded");

/**
 * Simulate typing in an <input> or <textarea>, character by character.
 */
async function simulateUserTyping(element, text, delay = 50) {
  return new Promise((resolve) => {
    // Simulate a click
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

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fillForm") {
    fillFormWithData(message.data);
  }
});

// Convert English month name to number
const monthToNumber = {
  January: "1",
  February: "2",
  March: "3",
  April: "4",
  May: "5",
  June: "6",
  July: "7",
  August: "8",
  September: "9",
  October: "10",
  November: "11",
  December: "12"
};

/**
 * Convert day, numericMonth, year to "YYYY-MM-DD" (for <input type="date">).
 */
function toDateInputValue(day, month, year) {
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  const yyyy = String(year);
  return `${yyyy}-${mm}-${dd}`;
}

/* -------------------- Sub-functions for fields -------------------- */

async function fillFirstNameField(firstName) {
  const field = document.querySelector(
    'input[name*="firstname" i], input[name*="first_name" i], input[placeholder*="Prénom" i], input[name*="firstnameinput" i]'
  );
  if (field) {
    await simulateUserTyping(field, firstName, 50);
  }
}

async function fillLastNameField(lastName) {
  const field = document.querySelector(
    'input[name*="lastname" i], input[name*="last_name" i], input[placeholder*="Nom de famille" i], input[name*="lasttnameinput" i]'
  );
  if (field) {
    await simulateUserTyping(field, lastName, 50);
  }
}

async function fillFullNameField(fullName) {
  const field = document.querySelector(
    'input[name="name"], input[placeholder*="nom complet" i]'
  );
  if (field) {
    await simulateUserTyping(field, fullName, 50);
  }
}

async function fillBirthdateField(birthdate) {
  const parts = birthdate.split(" ");
  if (parts.length !== 3) return;

  const [rawDay, rawMonth, rawYear] = parts;
  const numericMonth = monthToNumber[rawMonth] || "";

  // Facebook style?
  const fbDay = document.querySelector('select[name="birthday_day"]');
  const fbMonth = document.querySelector('select[name="birthday_month"]');
  const fbYear = document.querySelector('select[name="birthday_year"]');
  if (fbDay && fbMonth && fbYear) {
    fbDay.value = rawDay;
    fbMonth.value = numericMonth;
    fbYear.value = rawYear;
    return;
  }

  // Check <input type="date">
  let dateInput = document.querySelector('input[type="date"]') || document.querySelector('#birthdate');
  if (dateInput && dateInput.type === "date") {
    dateInput.value = toDateInputValue(rawDay, numericMonth, rawYear);
    return;
  }

  // Other cases (Google, MS, Twitter)
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
  const gSelect = document.querySelector('#gender, select[name="gender"], select[name*="gender" i]');
  if (gSelect) {
    // Google style: 1 => male, 2 => female, 3 => other
    if (genre.toLowerCase() === "female") {
      gSelect.value = "2";
    } else if (genre.toLowerCase() === "male") {
      gSelect.value = "1";
    } else {
      gSelect.value = "3";
    }
  } else {
    // Facebook style
    if (genre.toLowerCase() === "female") {
      const fRadio = document.querySelector('input[name="sex"][value="1"]');
      if (fRadio) fRadio.checked = true;
    } else if (genre.toLowerCase() === "male") {
      const mRadio = document.querySelector('input[name="sex"][value="2"]');
      if (mRadio) mRadio.checked = true;
    } else {
      const cRadio = document.querySelector('input[name="sex"][value="-1"]');
      if (cRadio) cRadio.checked = true;
    }
  }
}

/* ------------------------------------------------------------------
   fillFormWithData()
------------------------------------------------------------------ */
async function fillFormWithData(data) {
  console.log("Received data:", data);

  await fillFirstNameField(data.firstName);
  await fillLastNameField(data.lastName);
  await fillFullNameField(data.lastName + " " + data.firstName);
  await fillBirthdateField(data.birthdate);
  fillGenderField(data.genre);

  console.log("Form potentially filled (using sub-functions).");
}

/* ------------------------------------------------------------------
   Context menu part
------------------------------------------------------------------ */
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
  const fieldName = (elem.name || "").toLowerCase();

  if (fieldName.includes("first")) {
    await fillFirstNameField("Alice");
  }
  else if (fieldName.includes("last")) {
    await fillLastNameField("Smith");
  }
  else if (fieldName.includes("birth") || fieldName.includes("date")) {
    await fillBirthdateField("12 March 1987");
  }
  else if (fieldName.includes("gender")) {
    fillGenderField("Female");
  }
  else {
    await fillFullNameField("Smith Alice");
  }
}

async function fillAllFieldsIntelligent() {
  const fields = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
  
  for (const field of fields) {
    const nameLower = (field.name || "").toLowerCase();

    if (nameLower.includes("first")) {
      await fillFirstNameField("David");
    }
    else if (nameLower.includes("last")) {
      await fillLastNameField("Johnson");
    }
    else if (nameLower.includes("birth") || nameLower.includes("date")) {
      await fillBirthdateField("1 April 1990");
    }
    else if (nameLower.includes("gender")) {
      fillGenderField("Male");
    }
    else {
      await fillFullNameField("Johnson David");
    }
  }
}
