import streamDeck from "@elgato/streamdeck";

import { ToggleCam } from "./actions/toggle-cam";
import { ToggleMic } from "./actions/toggle-mic";
import { ToggleShareScreen } from "./actions/toggle-share-screen";
import { ToggleDesign } from "./actions/toggle-design";
import { ToggleLayout } from "./actions/toggle-layout";
import { ToggleSource } from "./actions/toggle-source";
import { WebSocketService } from "./websocket-service";

// Enable info logging
streamDeck.logger.setLevel("info");

// Create WebSocket service instance
const wsService = new WebSocketService();

// Register all actions
streamDeck.actions.registerAction(new ToggleCam(wsService));
streamDeck.actions.registerAction(new ToggleMic(wsService));
streamDeck.actions.registerAction(new ToggleShareScreen(wsService));
streamDeck.actions.registerAction(new ToggleDesign(wsService));
streamDeck.actions.registerAction(new ToggleLayout(wsService));
streamDeck.actions.registerAction(new ToggleSource(wsService));

// Connect to Stream Deck and initialize WebSocket connection
streamDeck.connect().then(async () => {
	streamDeck.logger.info("Stream Deck connected!");
	await wsService.connect();
});
