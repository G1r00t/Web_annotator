# Web Annotator Chrome Extension

## Overview

The Web Annotator Chrome Extension enhances user interaction with web content by providing powerful annotation tools. This extension allows users to highlight text on any webpage using customizable, color-coded highlights, enabling efficient categorization and organization of significant sections. Additionally, users can attach contextual notes to highlighted content, facilitating the addition of personal insights, comments, or supplementary information for future reference.

## Features

- **Highlighting**: Mark important sections of text with customizable color-coded highlights.
- **Annotations**: Add notes to highlighted content for additional context.
- **Persistence**: Annotations and highlights are saved across browser sessions.
- **Pen Tool**: Draw freehand annotations on any webpage.
- **Undo Functionality**: Easily undo the last highlight or annotation.
- **Save Annotations**: Export annotations as JSON for backup or sharing.

## Files

- **manifest.json**: Contains metadata about the extension and its permissions.
- **background.js**: Handles background tasks and event listeners.
- **content.js**: Injected into web pages to handle annotations and highlights.
- **popup.html**: The HTML structure of the extension's popup interface.
- **popup.js**: Manages the logic for the popup interface.

## Getting Started

### Prerequisites

- Google Chrome browser

### Installation

1. Clone the repository or download the zip file and extract it.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top-right corner.
4. Click on "Load unpacked" and select the directory where the extension files are located.

### Usage

1. Click on the extension icon in the Chrome toolbar to open the popup interface.
2. Use the pen tool to draw freehand annotations on the webpage.
3. Highlight text by selecting it and clicking the highlighter button in the popup.
4. Add notes to highlighted text by clicking on the highlighted section.
5. Save annotations using the save button in the popup.
6. Undo the last action by clicking the undo button.

## Permissions

This extension requires the following permissions:

- `contextMenus`
- `scripting`
- `storage`
- `tabs`
- `<all_urls>` for content scripts

## Technologies Used

- **HTML**: For the structure and layout of the extension.
- **CSS**: For styling the interface.
- **JavaScript**: For the functionality and logic of the extension.

## Future Improvements

- Add external database support for storing annotations.
- Enhance the user interface for better user experience.
- Implement more annotation tools and customization options.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- Rhythm Mundra (Developer)
- Tinkering Labs (Project Inspiration)
