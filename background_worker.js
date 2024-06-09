chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed successfully.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "storeAnnotations") {
    try {
      chrome.storage.local.set({ annotationsData: message.annotations, highlightsData: message.highlights }, () => {
        sendResponse({ status: "success" });
      });
    } catch (error) {
      console.error("Error saving data:", error);
      sendResponse({ status: "failure" });
    }
    return true;
  } else if (message.action === "retrieveAnnotations") {
    chrome.storage.local.get(['annotationsData', 'highlightsData'], (result) => {
      sendResponse({ annotations: result.annotationsData, highlights: result.highlightsData });
    });
    return true;
  }
});
