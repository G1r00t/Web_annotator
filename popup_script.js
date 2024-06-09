document.addEventListener('DOMContentLoaded', () => {
  let penActive = false;
  let highlighterActive = false;
  let selectedColor = "#FFFFFF";

  function updateButtonStyles() {
    document.getElementById('activatePen').style.backgroundColor = penActive ? '#D4D4D4' : 'FFFFFF';
    document.getElementById('activateHighlighter').style.backgroundColor = highlighterActive ? '#D4D4D4' : 'FFFFFF';
    document.getElementById('color-picker').value = selectedColor.toString();
  }

  document.getElementById('activatePen').addEventListener('click', () => {
    penActive = !penActive;
    highlighterActive = false;
    chrome.storage.local.set({ penActive, highlighterActive, selectedColor });
    updateButtonStyles();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "activatePen", status1: highlighterActive, status2: penActive });
      } else {
        console.error("No active tab found.");
      }
    });
  });

  document.getElementById('activateHighlighter').addEventListener('click', () => {
    highlighterActive = !highlighterActive;
    penActive = false;
    chrome.storage.local.set({ penActive, highlighterActive, selectedColor });
    updateButtonStyles();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "activateHighlighter", status1: highlighterActive, status2: penActive });
      } else {
        console.error("No active tab found.");
      }
    });
  });

  chrome.storage.local.get(['penActive', 'highlighterActive', 'selectedColor'], (result) => {
    penActive = result.penActive || false;
    highlighterActive = result.highlighterActive || false;
    selectedColor = result.selectedColor || '#FFFF00';
    updateButtonStyles();
  });

  document.getElementById('color-picker').addEventListener('change', (event) => {
    const selectedColorValue = event.target.value;
    selectedColor = selectedColorValue;
    chrome.storage.local.set({ penActive, highlighterActive, selectedColor });
    updateButtonStyles();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "updateColor", color: selectedColorValue });
      } else {
        console.error("No active tab found.");
      }
    });
  });

  document.getElementById('saveAnnotations').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "store" });
      } else {
        console.error("No active tab found.");
      }
    });
  });

  document.getElementById('undoAction').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        console.log("Sending 'undo' action to content script.");
        chrome.tabs.sendMessage(tabs[0].id, { action: "undoLastAction" });
      } else {
        console.error("No active tab found.");
      }
    });
  });
});
