# Unofficial Stream Deck Plugin for Restream

## Overview

Unofficial Elgato Stream Deck plugin that controls Restream Studio via a Chrome Extension.

![Screenshot of the Stream Deck plugin](src/org.pozil.restream.sdPlugin/previews/screenshot.png)

This solution requires three components to run:
1. A Node.js server
1. A Chrome extension
1. A Stream Deck plugin (this project)

## Stream Deck Plugin Setup

Download the [latest plugin version](https://github.com/pozil/streamdeck-restream-plugin/releases/latest/download/org.pozil.restream.streamDeckPlugin).

Install the plugin.

You're done with the Stream Deck plugin setup.
At this point you should have installed the Chrome extension and the server should be up and running.

## Troubleshooting

**Stream Deck button shows a ⚠️ warning symbol**

This either means that the server is not running or that the server cannot reach the Chrome extension.
