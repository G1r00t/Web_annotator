let startX, startY, currentPath;
let annotationCanvas, canvasContext;
let clickDelay;

let activeTool = null;
let activeColor = '#FF0000';

let annotationList = [];
let highlightList = [];
let actionHistory = [];

let isDrawing = false;
let toolType = 2;
let isTextSelecting = false;
let isMouseMoved = false;

function initializeCanvas() {
  annotationCanvas = document.createElement('canvas');
  annotationCanvas.style.position = 'absolute';
  annotationCanvas.style.top = '0';
  annotationCanvas.style.left = '0';
  annotationCanvas.style.pointerEvents = 'none';
  annotationCanvas.width = window.innerWidth;
  annotationCanvas.height = window.innerHeight;
  document.body.appendChild(annotationCanvas);
  canvasContext = annotationCanvas.getContext('2d');
  annotationCanvas.addEventListener('mousedown', handleMouseDownEvent);
  annotationCanvas.addEventListener('mousemove', handleMouseMoveEvent);
  annotationCanvas.addEventListener('mouseup', handleMouseUpEvent);
  loadStoredAnnotations();
  retrieveToolState();
}

function undoLastHighlightAction() {
  if (highlightList.length > 0) {
    const lastHighlight = highlightList.pop();
    const spanElement = document.querySelector(`span[data-highlight-id="${lastHighlight.id}"]`);
    if (spanElement) {
      spanElement.replaceWith(document.createTextNode(spanElement.textContent));
      actionHistory.push(2);
      console.log("Last highlight undone.");
    }
  }
}

function resizeCanvas(ratio) {
  const newWidth = window.innerWidth * ratio;
  const newHeight = window.innerHeight * ratio;
  annotationCanvas.width = newWidth;
  annotationCanvas.height = newHeight;
  console.log(`Canvas resized to ${newWidth}x${newHeight}`);
}

function confirmAndClearAllHighlights() {
  if (confirm("Do you want to clear all highlights?")) {
    highlightList = [];
    document.querySelectorAll('span[data-highlight-id]').forEach(span => {
      span.replaceWith(document.createTextNode(span.textContent));
    });
    console.log("All highlights cleared.");
  }
}

function updatePenToolWidth(width) {
  canvasContext.lineWidth = width;
  console.log(`Pen tool width set to ${width}`);
}

function updateHighlightColor(highlightId, newColor) {
  const highlight = highlightList.find(h => h.id === highlightId);
  if (highlight) {
    highlight.color = newColor;
    const spanElement = document.querySelector(`span[data-highlight-id="${highlightId}"]`);
    if (spanElement) {
      spanElement.style.backgroundColor = newColor;
      console.log(`Highlight color updated to ${newColor} for ID ${highlightId}`);
    }
  }
}

function handleMouseDownEvent(event) {
  if (activeTool === 'pen') {
    startPenDrawing(event);
  } else if (activeTool === 'highlighter') {
    isTextSelecting = true;
    isMouseMoved = false;
  }
}

function clearAnnotationsAndHighlights() {
  annotationList = [];
  highlightList = [];
  canvasContext.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);
  document.querySelectorAll('span[data-highlight-id]').forEach(span => {
    span.replaceWith(document.createTextNode(span.textContent));
  });
  console.log("All annotations and highlights cleared.");
}

function handleMouseMoveEvent(event) {
  if (activeTool === 'pen' && isDrawing) {
    drawOnCanvas(event);
  } else if (isTextSelecting) {
    isMouseMoved = true;
  }
}

function handleMouseUpEvent(event) {
  if (activeTool === 'pen' && isDrawing) {
    stopPenDrawing(activeColor);
  } else if (activeTool === 'highlighter' && isTextSelecting) {
    isTextSelecting = false;
    if (isMouseMoved) {
      clearTimeout(clickDelay);
      clickDelay = setTimeout(() => {
        applyTextHighlight();
      }, 200);
    }
  }
}

function startPenDrawing(event) {
  annotationCanvas.style.pointerEvents = 'auto';
  isDrawing = true;
  startX = event.clientX;
  startY = event.clientY;
  currentPath = [{ x: startX, y: startY }];
}

function drawOnCanvas(event) {
  if (!isDrawing) return;
  canvasContext.strokeStyle = activeColor;
  canvasContext.lineWidth = 2;
  canvasContext.lineCap = 'round';
  canvasContext.globalAlpha = 1.0;

  canvasContext.beginPath();
  canvasContext.moveTo(startX, startY);
  canvasContext.lineTo(event.clientX, event.clientY);
  canvasContext.stroke();

  startX = event.clientX;
  startY = event.clientY;
  currentPath.push({ x: startX, y: startY });
}

function stopPenDrawing(color) {
  if (!isDrawing) return;
  isDrawing = false;
  if (currentPath.length > 1) {
    actionHistory.push(1);
    annotationList.push({ tool: 'pen', color: color, path: currentPath });
  }
}

function applyTextHighlight() {
  if (activeTool === 'highlighter') {
    const note = prompt("Enter a note for this highlight:");
    wrapSelectedText(activeColor, note);
  }
}

function wrapSelectedText(color, note) {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const spanElement = document.createElement('span');
    spanElement.style.backgroundColor = color;
    spanElement.setAttribute('data-highlight-id', Date.now());
    range.surroundContents(spanElement);
    actionHistory.push(2);
    highlightList.push({ span: spanElement.outerHTML, range: range.toString(), color: color, id: spanElement.getAttribute('data-highlight-id'), note: note });
  }
}

function loadStoredAnnotations() {
  chrome.runtime.sendMessage({ action: "retrieveAnnotations" }, (response) => {
    if (response && response.annotations) {
      annotationList = response.annotations;
      highlightList = response.highlights;
      toolType = 2;
      redrawCanvas(toolType);
    } else {
      console.log("No stored annotations found.");
    }
  });
}

function retrieveToolState() {
  chrome.storage.local.get(['PenToolActive', 'HighlighterToolActive', 'SelectedColor'], (result) => {
    if (result.PenToolActive) {
      activeTool = 'pen';
      annotationCanvas.style.pointerEvents = 'auto';
      activeColor = result.SelectedColor || '#FFFF00';
    } else if (result.HighlighterToolActive) {
      activeTool = 'highlighter';
      annotationCanvas.style.pointerEvents = 'none';
      activeColor = result.SelectedColor || '#FFFF00';
    } else {
      activeTool = null;
      annotationCanvas.style.pointerEvents = 'none';
      activeColor = result.SelectedColor || '#FFFF00';
    }
  });
}

function redrawCanvas(toolType) {
  canvasContext.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);
  if (toolType === 2 || toolType === 1) {
    highlightList.forEach(highlight => {
      const spanElement = document.createElement('span');
      spanElement.innerHTML = highlight.range;
      spanElement.style.backgroundColor = highlight.color;
      spanElement.setAttribute('data-highlight-id', highlight.id);
      const bodyContent = document.body.innerHTML;
      const highlightedContent = bodyContent.replace(highlight.range, spanElement.outerHTML);
      document.body.innerHTML = highlightedContent;
    });
  }
  if (toolType === 2 || toolType === 1) {
    annotationList.forEach(annotation => {
      canvasContext.strokeStyle = annotation.color;
      canvasContext.lineWidth = 2;
      canvasContext.globalAlpha = 1.0;
      canvasContext.lineCap = 'round';
      const paths = annotation.path;
      for (let i = 1; i < paths.length; i++) {
        canvasContext.beginPath();
        canvasContext.moveTo(paths[i - 1].x, paths[i - 1].y);
        canvasContext.lineTo(paths[i].x, paths[i].y);
        canvasContext.stroke();
      }
    });
  }
}

initializeCanvas();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "activatePen") {
    activeTool = message.status2 ? 'pen' : null;
    annotationCanvas.style.pointerEvents = message.status2 ? 'auto' : 'none';
  } else if (message.action === "activateHighlighter") {
    activeTool = message.status1 ? 'highlighter' : null;
    annotationCanvas.style.pointerEvents = message.status1 ? 'none' : 'none';
    if (activeTool === 'highlighter') {
      document.addEventListener('mousedown', handleMouseDownEvent);
      document.addEventListener('mousemove', handleMouseMoveEvent);
      document.addEventListener('mouseup', handleMouseUpEvent);
    }
  } else if (message.action === "updateColor") {
    activeColor = message.color;
  } else if (message.action === "store") {
    chrome.runtime.sendMessage({ action: "storeAnnotations", annotations: annotationList, highlights: highlightList }, (response) => {
      if (response && response.status === "success") {
        alert("Annotations saved successfully!");
      }
    });
  } else if (message.action === "undoLastAction") {
    toolType = 1;
    const lastAction = actionHistory.pop();
    if (lastAction === 1) {
      if (annotationList.length > 0) {
        const lastAnnotation = annotationList.pop();
        redrawCanvas(toolType);
      }
    } else if (lastAction === 2) {
      if (highlightList.length > 0) {
        const lastHighlight = highlightList.pop();
        const spanElement = document.querySelector(`span[data-highlight-id="${lastHighlight.id}"]`);
        if (spanElement) {
          spanElement.replaceWith(document.createTextNode(spanElement.textContent));
        }
        redrawCanvas(toolType);
      }
    }
  }
});

document.addEventListener('click', (event) => {
  if (event.target.tagName === 'SPAN' && event.target.hasAttribute('data-highlight-id')) {
    const highlightId = event.target.getAttribute('data-highlight-id');
    const highlight = highlightList.find(h => h.id === highlightId);
    if (highlight && highlight.note) {
      alert(`Note: ${highlight.note}`);
    }
  }
});
