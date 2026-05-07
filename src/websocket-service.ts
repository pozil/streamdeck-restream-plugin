import streamDeck from "@elgato/streamdeck";
import { WebSocket } from "ws";
import EventEmitter from 'node:events';

const WEBSOCKET_URL = 'ws://127.0.0.1:5000/?client-type=streamdeck';
const WEBSOCKET_RETRY_DELAY = 1000;

const STATE_CHANGE_EVENT = 'statechange';

type WebSocketMessage = {
	action: string;
	context: string;
	type?: string;
	index?: number;
};

export type RestreamState = {
	isMicEnabled: boolean;
	isCameraEnabled: boolean;
	isSharingScreen: boolean;
	activeLayoutIndex: number;
	sources: Array<{
		type: 'All Scenes' | 'Screen share';
		label: string;
		isActive: boolean;
	}>;
	activeOverlayIndex: number;
	activeVideoClipIndex: number;
	activeBackgroundIndex: number;
};

/**
 * WebSocket service for communicating with the Restream server.
 */
export class WebSocketService {
	private websocket?: WebSocket;
	private isConnected = false;
	private eventEmitter = new EventEmitter();

	/**
	 * Establish WebSocket connection with the Restream server.
	 */
	async connect(): Promise<void> {
		return new Promise((resolve) => {
			this.isConnected = false;
			this.websocket = new WebSocket(WEBSOCKET_URL);

			this.websocket.onmessage = (event) => {
				this.handleMessage(event.data.toString());
			};

			this.websocket.onerror = (error) => {
				if (this.isConnected) {
					streamDeck.logger.error('WebSocket error:', error);
				}
			};

			this.websocket.onclose = async () => {
				if (this.isConnected) {
					streamDeck.logger.info('WebSocket closed');
				}
				this.isConnected = false;
				this.websocket = undefined;
				streamDeck.logger.info(`Retrying WebSocket connection in ${WEBSOCKET_RETRY_DELAY}ms...`);
				await this.wait(WEBSOCKET_RETRY_DELAY);
				await this.connect();
			};

			this.websocket.onopen = () => {
				streamDeck.logger.info('WebSocket connected');
				this.isConnected = true;
				resolve();
			};
		});
	}

	/**
	 * Send a message to the WebSocket server.
	 */
	async sendMessage(message: WebSocketMessage): Promise<void> {
		if (this.isConnected && this.websocket) {
			this.websocket.send(JSON.stringify(message));
			const action = streamDeck.actions.getActionById(message.context);
			if (action && 'showOk' in action) {
				await action.showOk();
			}
		} else if (message.context) {
			const action = streamDeck.actions.getActionById(message.context);
			if (action && 'showAlert' in action) {
				await action.showAlert();
			}
		}
	}

	registerStateChangeHandler(handlerFunction: (state: RestreamState) => void) {
		this.eventEmitter.on(STATE_CHANGE_EVENT, handlerFunction);
	}

	/**
	 * Handle incoming WebSocket messages.
	 */
	private handleMessage(data: string): void {
		const message = JSON.parse(data);
		switch (message.type) {
			case 'state':
				this.eventEmitter.emit(STATE_CHANGE_EVENT, message.state);
				break;
			case 'not-delivered':
				streamDeck.actions.getActionById(message.data.context)?.showAlert();
				break;
		}
	}

	/**
	 * Wait for a given duration.
	 */
	private async wait(duration: number): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, duration);
		});
	}
}
