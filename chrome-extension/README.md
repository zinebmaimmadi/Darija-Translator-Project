# Chrome Extension Prototype

Manifest V3 side-panel prototype aligned with the assignment requirements.

## Features in this design pass

- `chrome.sidePanel` layout with a polished translation workspace
- context-menu entry for selected text
- automatic selected-text handoff into the panel draft area
- real translation requests sent to the local Jakarta backend
- read-aloud preview for the latest translated response

## Load in Chrome

1. Open `chrome://extensions`
2. Enable Developer mode
3. Choose **Load unpacked**
4. Select the `chrome-extension` folder

The extension expects the backend at `http://127.0.0.1:8082/api`, and the backend expects `GEMINI_API_KEY`.
