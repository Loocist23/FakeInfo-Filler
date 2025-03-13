// When the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  // Create the "Fill This Input" menu item (only on editable fields)
  chrome.contextMenus.create({
    id: "fillThisInput",
    title: "Fill This Input",
    contexts: ["editable"] // Only if right-click on <input>, <textarea>, contenteditable...
  });

  // Create the "Fill All Inputs" menu item
  chrome.contextMenus.create({
    id: "fillAllInputs",
    title: "Fill All Inputs",
    contexts: ["all"]
  });
});

// When a menu item is clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "fillThisInput") {
    chrome.tabs.sendMessage(tab.id, { action: "fillOneInput" });
  } else if (info.menuItemId === "fillAllInputs") {
    chrome.tabs.sendMessage(tab.id, { action: "fillAllInputs" });
  }
});
