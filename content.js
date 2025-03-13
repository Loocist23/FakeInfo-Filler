console.log("content.js chargé");

/**
 * Simule une saisie de texte dans un <input> ou <textarea>, caractère par caractère.
 * @param {HTMLInputElement|HTMLTextAreaElement} element  L'élément où taper
 * @param {string} text                                  Le texte à saisir
 * @param {number} [delay=50]                            Délai en ms entre chaque caractère
 * @return {Promise<void>}
 */
async function simulateUserTyping(element, text, delay = 50) {
    return new Promise((resolve) => {

        // 1) On simule un clic dans le champ
        const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
        element.dispatchEvent(mouseDownEvent);

        const mouseUpEvent = new MouseEvent("mouseup", { bubbles: true, cancelable: true });
        element.dispatchEvent(mouseUpEvent);

        // (facultatif) un event 'click' 
        const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
        element.dispatchEvent(clickEvent);

        // 2) On focus
        element.focus();

        // 3) On vide le champ
        element.value = "";

        let i = 0;
        const intervalId = setInterval(() => {
            if (i < text.length) {
                const char = text[i];

                // keydown
                const keyDownEvent = new KeyboardEvent("keydown", {
                    key: char,
                    bubbles: true,
                    cancelable: true
                });
                element.dispatchEvent(keyDownEvent);

                // keypress
                const keyPressEvent = new KeyboardEvent("keypress", {
                    key: char,
                    bubbles: true,
                    cancelable: true
                });
                element.dispatchEvent(keyPressEvent);

                // On ajoute le caractère
                element.value += char;

                // input
                const inputEvent = new InputEvent("input", {
                    data: char,
                    bubbles: true,
                    cancelable: false,
                    inputType: "insertText"
                });
                element.dispatchEvent(inputEvent);

                // keyup
                const keyUpEvent = new KeyboardEvent("keyup", {
                    key: char,
                    bubbles: true,
                    cancelable: true
                });
                element.dispatchEvent(keyUpEvent);

                i++;
            } else {
                clearInterval(intervalId);

                // 4) On "blur"
                element.blur();

                // 5) On déclenche un event "change"
                const changeEvent = new Event("change", {
                    bubbles: true,
                    cancelable: true
                });
                element.dispatchEvent(changeEvent);

                // 6) Optionnel : un event "focusout" 
                // (certains sites écoutent "focusout" plutôt que "blur")
                const focusOutEvent = new FocusEvent("focusout", {
                    bubbles: true,
                    cancelable: true
                });
                element.dispatchEvent(focusOutEvent);

                resolve();
            }
        }, delay);
    });
}


// Écouter le message en provenance de popup.js
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fillForm") {
        fillFormWithData(message.data);
    }
});

// Conversion texte Anglais -> chiffre pour le mois
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
 * Convertit un triplet (day, numericMonth, year) en chaîne "YYYY-MM-DD" (HTML5 date).
 * @example toDateInputValue("12","3","1987") => "1987-03-12"
 */
function toDateInputValue(day, month, year) {
    const dd = String(day).padStart(2, "0");
    const mm = String(month).padStart(2, "0");
    const yyyy = String(year);
    return `${yyyy}-${mm}-${dd}`;
}


/* ------------------------------------------------------------------
    PARTIE AVEC DES SOUS-FONCTIONS 
    (pour un code plus découpé et plus "intelligent")
------------------------------------------------------------------ */

/**
 * fillFirstNameField() : cherche un champ prénom et le remplit avec simulateUserTyping.
 */
async function fillFirstNameField(firstName) {
    const firstNameField = document.querySelector(
        'input[name*="firstname" i], input[name*="first_name" i], input[placeholder*="Prénom" i], input[name*="firstnameinput" i]'
    );
    if (firstNameField) {
        await simulateUserTyping(firstNameField, firstName, 50);
    }
}

/**
 * fillLastNameField() : cherche un champ nom de famille et le remplit.
 */
async function fillLastNameField(lastName) {
    const lastNameField = document.querySelector(
        'input[name*="lastname" i], input[name*="last_name" i], input[placeholder*="Nom de famille" i], input[name*="lasttnameinput" i]'
    );
    if (lastNameField) {
        await simulateUserTyping(lastNameField, lastName, 50);
    }
}

/**
 * fillFullNameField() : pour les sites qui n'ont qu'un seul champ "name" complet
 */
async function fillFullNameField(fullName) {
    const nameField = document.querySelector(
        'input[name="name"], input[placeholder*="nom complet" i]'
    );
    if (nameField) {
        await simulateUserTyping(nameField, fullName, 50);
    }
}

/**
 * fillBirthdateField() : gère la date de naissance (jour/mois/année, ou un <input type=date>)
 * @param {string} birthdate  ex: "12 March 1987"
 * 
 * Logique : 
 *  - On split la date en jour / mois / année
 *  - On check si c'est Facebook (birthday_day, etc.) ou Google (#day, #month, #year), etc.
 */
async function fillBirthdateField(birthdate) {
    const birthParts = birthdate.split(" ");
    if (birthParts.length !== 3) return;

    const [rawDay, rawMonth, rawYear] = birthParts;
    const numericMonth = monthToNumber[rawMonth] || ""; // "March" -> "3"

    // Facebook style ?
    const fbDaySelect = document.querySelector('select[name="birthday_day"]');
    const fbMonthSelect = document.querySelector('select[name="birthday_month"]');
    const fbYearSelect = document.querySelector('select[name="birthday_year"]');

    if (fbDaySelect && fbMonthSelect && fbYearSelect) {
        fbDaySelect.value = rawDay;
        fbMonthSelect.value = numericMonth;
        fbYearSelect.value = rawYear;
        return;
    }

    // Autres : Google, Microsoft, Twitter, ou un <input type=date> ?

    // <input type="date"> ?
    let dateInput = document.querySelector('input[type="date"]') 
                 || document.querySelector('#birthdate');
    if (dateInput && dateInput.type === "date") {
        const dateValue = toDateInputValue(rawDay, numericMonth, rawYear);
        dateInput.value = dateValue;
        return;
    }

    // Sinon on cherche #month, #day, #year, ou #BirthDay, #BirthMonth, etc.
    // Mois
    let monthSelect = document.querySelector("#SELECTOR_1") 
                   || document.querySelector("#month") 
                   || document.querySelector("#BirthMonth")
                   || document.querySelector('select[name*="month" i], select[name="BirthMonth"]');

    if (monthSelect && monthSelect.tagName.toLowerCase() === "select") {
        monthSelect.value = numericMonth;
    } else {
        let monthInput = document.querySelector('input[name*="month" i]');
        if (monthInput) {
            await simulateUserTyping(monthInput, numericMonth);
        }
    }

    // Jour
    let daySelect = document.querySelector("#SELECTOR_2") 
                 || document.querySelector("#day") 
                 || document.querySelector("#BirthDay") 
                 || document.querySelector('select[name*="day" i], select[name="BirthDay"]');

    if (daySelect && daySelect.tagName.toLowerCase() === "select") {
        daySelect.value = rawDay;
    } else if (daySelect && daySelect.tagName.toLowerCase() === "input") {
        await simulateUserTyping(daySelect, rawDay);
    } else {
        let dayInput = document.querySelector('input[name*="day" i]');
        if (dayInput) {
            await simulateUserTyping(dayInput, rawDay);
        }
    }

    // Année
    let yearSelect = document.querySelector("#SELECTOR_3") 
                  || document.querySelector("#year") 
                  || document.querySelector("#BirthYear") 
                  || document.querySelector('select[name*="year" i], select[name="BirthYear"]');

    if (yearSelect && yearSelect.tagName.toLowerCase() === "select") {
        yearSelect.value = rawYear;
    } else if (yearSelect && yearSelect.tagName.toLowerCase() === "input") {
        await simulateUserTyping(yearSelect, rawYear);
    } else {
        let yearInput = document.querySelector('input[name*="year" i]');
        if (yearInput) {
            await simulateUserTyping(yearInput, rawYear);
        }
    }
}

/**
 * fillGenderField() : gère le genre (Female/Male/Custom)
 */
function fillGenderField(genre) {
    // Google => #gender (1 => Homme, 2 => Femme, 3 => Non précisé)
    const googleGenderSelect = document.querySelector('#gender, select[name="gender"], select[name*="gender" i]');
    if (googleGenderSelect) {
        if (genre.toLowerCase() === "female") {
            googleGenderSelect.value = "2";
        } else if (genre.toLowerCase() === "male") {
            googleGenderSelect.value = "1";
        } else {
            googleGenderSelect.value = "3"; // Non précisé
        }
    } else {
        // Facebook (radio name="sex")
        // value="1" => female, value="2" => male
        if (genre.toLowerCase() === "female") {
            const femaleRadio = document.querySelector('input[name="sex"][value="1"]');
            if (femaleRadio) femaleRadio.checked = true;
        } else if (genre.toLowerCase() === "male") {
            const maleRadio = document.querySelector('input[name="sex"][value="2"]');
            if (maleRadio) maleRadio.checked = true;
        } else {
            const customRadio = document.querySelector('input[name="sex"][value="-1"]');
            if (customRadio) customRadio.checked = true;
        }
    }
}

/* ------------------------------------------------------------------
    FIN DES SOUS-FONCTIONS
------------------------------------------------------------------ */

/**
 * fillFormWithData({ firstName, lastName, birthdate, genre })
 */
async function fillFormWithData(data) {
    console.log("Données reçues :", data);

    // 1) Prénom
    await fillFirstNameField(data.firstName);

    // 2) Nom
    await fillLastNameField(data.lastName);

    // 3) Champ "name" si besoin => lastName + " " + firstName
    await fillFullNameField(data.lastName + " " + data.firstName);

    // 4) Date de naissance
    await fillBirthdateField(data.birthdate);

    // 5) Genre
    fillGenderField(data.genre);

    console.log("Formulaire potentiellement rempli (avec sous-fonctions).");
}


/* ------------------------------------------------------------------
   PARTIE : CLique Droit (context menu)
   Utilise les fonctions qu'on a créées
------------------------------------------------------------------ */

/**
 * Mémorise le dernier champ où on a fait clic droit.
 */
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

/**
 * On écoute les messages "fillOneInput" / "fillAllInputs" depuis background.js
 */
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "fillOneInput") {
    if (lastRightClickedElement) {
      fillOneFieldIntelligent(lastRightClickedElement);
    }
  } else if (msg.action === "fillAllInputs") {
    fillAllFieldsIntelligent();
  }
});

/**
 * fillOneFieldIntelligent(elem)
 * - Analyse l'input pour voir s'il correspond à "first name", "last name", "birthdate"...
 * - Appelle la sous-fonction appropriée (fillFirstNameField, fillBirthdateField, etc.)
 */
async function fillOneFieldIntelligent(elem) {
  // On récupère le 'name' (en minuscules) pour deviner le type de champ
  const fieldName = (elem.name || "").toLowerCase();

  if (fieldName.includes("first")) {
    // Prénom
    await fillFirstNameField("Alice"); 
  } 
  else if (fieldName.includes("last")) {
    // Nom
    await fillLastNameField("Smith");
  }
  else if (fieldName.includes("birth") || fieldName.includes("date")) {
    // Date de naissance
    await fillBirthdateField("12 March 1987");
  }
  else if (fieldName.includes("gender")) {
    // Genre
    fillGenderField("Female");
  }
  else {
    // Sinon, on considère que c'est un champ "full name"
    await fillFullNameField("Smith Alice");
  }
}

/**
 * fillAllFieldsIntelligent()
 * - Parcourt tous les <input> / <textarea>, et selon le "name", 
 *   appelle la sous-fonction appropriée ou y met des valeurs standard.
 */
async function fillAllFieldsIntelligent() {
  // On récupère tous les champs de type text, email, etc.
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
      // Par défaut => fullName
      await fillFullNameField("Johnson David");
    }
  }
}
