# Unofficial Stream Deck Plugin for Restream

## Overview

Unofficial Elgato Stream Deck plugin that controls Restream Studio via a Chrome Extension.

![Screenshot of the Stream Deck plugin](src/org.pozil.restream.sdPlugin/previews/screenshot.png)

This solution requires three components to run:
1. [A Node.js server](https://github.com/pozil/streamdeck-restream-server)
1. [A Chrome extension](https://github.com/pozil/restream-chrome-extension)
1. A Stream Deck plugin (this project)

## Node.js Server Setup

1. Download or clone the [Node.js server repository](https://github.com/pozil/streamdeck-restream-server).

1. Ensure that you have [Node.js](https://nodejs.org/en) v20 or above by running this command in a terminal:
    ```sh
    node -v
    ```

1. Install the server dependencies:
    ```sh
    npm install
    ```

1. Start the server:
    ```sh
    npm start
    ```

## Chrome Extension Setup

Install the [Chrome extension](https://chromewebstore.google.com/u/1/detail/restream-studio-controls/aljahkhjciggopmeccklmohhagoinpal?hl=en) from the Chrome Web Store.


## Stream Deck Plugin Setup

Download and install the [Stream Deck plugin](https://github.com/pozil/streamdeck-restream-plugin/releases/latest/download/org.pozil.restream.streamDeckPlugin).


## Configure Your Stream

1. Open Restream Studio
1. Ensure that the Node.js server is up and running. If not, open a terminal in the `streamdeck-restream-server` folder and restart the server by running `npm start`. Leave the terminal open.
1. Ensure that the Chrome extension icon is green. If not, check the [troubleshooting](#troubleshooting) section.
1. Create a Stream Deck profile and add actions from the Restream plugin. I recommend that you try the Toggle Camera action for a start.
1. Test the actions by pressing the related Stream Deck button. If a ⚠️ warning symbol appears, check the [troubleshooting](#troubleshooting) section.


## Troubleshooting

**Chrome extension icon is gray with a red stroke**

This either means that the Node.js server is not running or that the server cannot reach the Stream Deck plugin. Hover your mouse over the Chrome extension icon for more details about the issue.

**Stream Deck button shows a ⚠️ warning symbol**

This either means that the Node.js server is not running or that the server cannot reach the Chrome extension.
