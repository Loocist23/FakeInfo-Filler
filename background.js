// Lors de l'installation ou la mise à jour de l'extension
chrome.runtime.onInstalled.addListener(() => {
    // Crée le menu "Fill This Input" (seulement sur un champ éditable)
    chrome.contextMenus.create({
      id: "fillThisInput",
      title: "Fill This Input",
      contexts: ["editable"] // seulement si clic droit sur <input>, <textarea>, contenteditable...
    });
  
    // Crée le menu "Fill All Inputs"
    chrome.contextMenus.create({
      id: "fillAllInputs",
      title: "Fill All Inputs",
      contexts: ["all"]
    });
  });
  
  // Quand on clique sur un item de menu
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "fillThisInput") {
      chrome.tabs.sendMessage(tab.id, { action: "fillOneInput" });
    } else if (info.menuItemId === "fillAllInputs") {
      chrome.tabs.sendMessage(tab.id, { action: "fillAllInputs" });
    }
  });
  