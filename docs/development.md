# Development – Qortal Chrome Extension

Requirements for building and running the extension from source:

- Install Node.js (which includes npm) from the [official site](https://nodejs.org/en/download)
- Use an IDE such as VS Code, IntelliJ, or any editor with TypeScript support
- Have a Chromium-based browser (Chrome, Brave, Edge, etc.) available so you can load the unpacked extension in Developer Mode

## Running the Qortal Chrome Extension while developing

Follow these steps:

- install dependencies: `npm install`
- start the Vite dev server for instant feedback while editing UI components: `npm run dev`
- open `http://localhost:5173/` to interact with the running instance outside of the extension shell (hot module reload will reflect UI changes immediately)

When you need to exercise the browser extension context:

- emit the extension bundle continuously: `npm run build -- --watch`
- open `chrome://extensions/` (or the equivalent in your Chromium browser)
- enable **Developer mode**
- press **Load unpacked** and select the local `dist` directory
- after each rebuild, click the refresh icon on the extension card (or restart `npm run build -- --watch`) so Chrome reloads the updated assets

## Build the Qortal Chrome Extension from source

Follow these steps:

- install dependencies: `npm install`
- run a production build: `npm run build`
- the compiled extension assets (UI bundle, background script, content script, manifest, and static media) are written to the `dist` directory
- load `dist` as an unpacked extension for manual testing, or zip its contents to publish through the Chrome Web Store or to share directly with testers

## Contribution guide

Contributions are welcome through GitHub pull requests. Please open an issue or conversation for larger changes, keep commits focused, and document any manual testing that verifies the update.
