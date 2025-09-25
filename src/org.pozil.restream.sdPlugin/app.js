/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const WEBSOCKET_URL = 'ws://127.0.0.1:5000/?client-type=streamdeck';
const WEBSOCKET_RETRY_DELAY = 1000;

var websocket;
var isConnected = false;

/**
 * @typedef {Object} ActionInstance
 * @property {string} action action namespace
 * @property {string} context action context ID
 * @property {string} device device ID
 * @property {string} event latest Stream Deck event name
 * @property {ActionInstancePayload} payload
 */

/**
 * @typedef {Object} ActionInstancePayload
 * @property {string} controller
 * @property {Object} coordinates
 * @property {boolean} isInMultiAction
 * @property {Map<string,Object>} settings settings as key/value pairs
 * @property {number} state
 */


/**
 * List of action instances where:
 * - key is the action context ID
 * - value is the action definition including settings
 * @type {Map<string,ActionInstance>}
 */
const actionInstances = new Map();

/**
 * List of action definitions
 */
const ACTION_TOGGLE_CAM = 'org.pozil.restream.toggle-cam';
const ACTION_TOGGLE_DESIGN = 'org.pozil.restream.toggle-design';
const ACTION_TOGGLE_LAYOUT = 'org.pozil.restream.toggle-layout';
const ACTION_TOGGLE_MIC = 'org.pozil.restream.toggle-mic';
const ACTION_TOGGLE_SHARE_SCREEN = 'org.pozil.restream.toggle-share-screen';
const ACTION_TOGGLE_SOURCE = 'org.pozil.restream.toggle-source';
const ACTION_DEFINITIONS = [
	{
		namespace: ACTION_TOGGLE_CAM,
		keyUpHandler: handleCamKeyUp
	},
	{
		namespace: ACTION_TOGGLE_DESIGN,
		keyUpHandler: handleDesignKeyUp
	},
	{
		namespace: ACTION_TOGGLE_LAYOUT,
		keyUpHandler: handleLayoutKeyUp,
		settingsChangeHandler: handleLayoutSettingsChange
	},
	{
		namespace: ACTION_TOGGLE_MIC,
		keyUpHandler: handleMicKeyUp
	},
	{
		namespace: ACTION_TOGGLE_SHARE_SCREEN,
		keyUpHandler: handleShareScreenKeyUp
	},
	{
		namespace: ACTION_TOGGLE_SOURCE,
		keyUpHandler: handleSourceKeyUp
	}
];

// Register action definitions
ACTION_DEFINITIONS.forEach(actionDef => {
	const action = new Action(actionDef.namespace);
	action.onKeyUp((event) => {
		lastActionContext = event.context;
		actionDef.keyUpHandler(event);
	});
	action.onWillAppear((event) => {
		actionInstances.set(event.context, event);
	});
	action.onDidReceiveSettings((event) => {
		actionInstances.set(event.context, event);
		if (actionDef.settingsChangeHandler) {
			actionDef.settingsChangeHandler(event);
		}
	});
	action.onWillDisappear((event) => {
		actionInstances.delete(event.context);
	});
});

// Action handlers
function handleCamKeyUp(event) {
	sendWsMessage({ action: 'toggle-cam', context: event.context });
}

function handleDesignKeyUp(event) {
	const { type } = event.payload.settings;
	const index = Number.parseInt(event.payload.settings.index, 10);
	sendWsMessage({ action: 'toggle-design', context: event.context, type, index });
}

function handleLayoutKeyUp(event) {
	const index = Number.parseInt(event.payload.settings.layoutIndex, 10);
	sendWsMessage({ action: 'toggle-layout', context: event.context, index });
}

function handleLayoutSettingsChange(event) {
	const index = Number.parseInt(event.payload.settings.layoutIndex, 10);
	$SD.setState(event.context, index);
}

function handleMicKeyUp(event) {
	sendWsMessage({ action: 'toggle-mic', context: event.context });
}

function handleShareScreenKeyUp(event) {
	sendWsMessage({ action: 'toggle-share-screen', context: event.context });
}

function handleSourceKeyUp(event) {
	const index = Number.parseInt(event.payload.settings.index, 10);
	sendWsMessage({ action: 'toggle-source', context: event.context, index });
}

/**
 * The first event fired when Stream Deck starts
 */
$SD.onConnected(async ({ actionInfo, appInfo, connection, messageType, port, uuid }) => {
	console.log('Stream Deck connected!');
	await connectWebSocket();
});

/**
 * Handles incoming Websocket events
 * @param {*} event 
 */
function handleWsMessage(event) {
	console.log('WS message: ', event.data);
	const message = JSON.parse(event.data);
	switch (message.type) {
		case 'state':
			handleStateUpdate(message.state);
		break;
		case 'not-delivered':
			$SD.showAlert(message.data.context);
		break;
	}
}

function handleStateUpdate(state) {
	const {
		isMicEnabled,
		isCameraEnabled,
		isSharingScreen,
		activeLayoutIndex,
		sources,
		activeOverlayIndex,
		activeVideoClipIndex,
		activeBackgroundIndex
	} = state;

	// Cam
	forActionsOfType(ACTION_TOGGLE_CAM, action => {
		$SD.setState(action.context, isCameraEnabled ? 0 : 1);
	});
	// Screen sharing
	forActionsOfType(ACTION_TOGGLE_SHARE_SCREEN, action => {
		$SD.setState(action.context, isSharingScreen ? 0 : 1);
	});
	// Layout
	forActionsOfType(ACTION_TOGGLE_LAYOUT, action => {
		const layoutIndex = Number.parseInt(action.payload.settings.layoutIndex, 10);
		const state = layoutIndex + (layoutIndex === activeLayoutIndex ? 6 : 0);
		$SD.setState(action.context, state);
	});
	// Mic
	forActionsOfType(ACTION_TOGGLE_MIC, action => {
		$SD.setState(action.context, isMicEnabled ? 0 : 1);
	});
	// Source
	forActionsOfType(ACTION_TOGGLE_SOURCE, action => {
		const index = Number.parseInt(action.payload.settings.index, 10);
		if (index < sources.length) {
			const { type, label, isActive } = sources[index];
			let state = 0;
			if (type === 'Camera') {
				state = isActive ? 0 : 1;
			} else {
				state = isActive ? 2 : 3;
			}
			$SD.setState(action.context, state);
			$SD.setTitle(action.context, label);
		} else {
			$SD.setState(action.context, 0);
			$SD.setTitle(action.context, 'Unknown');
		}
	});
	// Design
	forActionsOfType(ACTION_TOGGLE_DESIGN, action => {
		const { type } = action.payload.settings;
		const index = Number.parseInt(action.payload.settings.index, 10);
		let isActive = false;
		switch (type) {
			case 'overlay':
				isActive = (activeOverlayIndex === index);
			break;
			case 'video':
				isActive = (activeVideoClipIndex === index);
			break;
			case 'background':
				isActive = (activeBackgroundIndex === index);
			break;
		}
		$SD.setState(action.context, isActive ? 1 : 0);
	});
}

function sendWsMessage(data) {
	if (isConnected) {
		websocket.send(JSON.stringify(data));
		$SD.showOk(data.context);
	} else if (data.context) {
		$SD.showAlert(data.context);	
	}
}

/**
 * Establish websocket connection with the WS server.
 * @returns {Promise<void>}
 */
async function connectWebSocket() {
	return new Promise((resolve) => {
	  isConnected = false;
	  websocket = new WebSocket(WEBSOCKET_URL);
  
	  websocket.onmessage = handleWsMessage;
	
	  websocket.onerror = (error) => {
		if (isConnected) {
		  console.error('WS error: ', error);
		}
	  }
  
	  websocket.onclose = async () => {
		if (isConnected) {
		  console.log('WS closed');
		}
		isConnected = false;
		websocket = undefined;
		console.log(`Retrying WS connection in ${WEBSOCKET_RETRY_DELAY}ms...`);
		await wait(WEBSOCKET_RETRY_DELAY);
		await connectWebSocket();
	  };
  
	  websocket.onopen = () => {
		console.log('WS connected');
		isConnected = true;
		resolve();
	  };
	});
}

/**
 * Callback for acting on actions
 * @callback forActionsOfTypeCallback
 * @param {ActionInstance} action
 */

/**
 * Calls a function on all actions of given type
 * @param {string} actionType 
 * @param {forActionsOfTypeCallback} callFunction 
 */
function forActionsOfType(actionType, callFunction) {
	for (const action of actionInstances.values()) {
		if (action.action === actionType) {
			callFunction(action);
		}
	}
}

/**
 * Waits for a given duration.
 * @param {number} duration duration in milliseconds
 * @returns {Promise<void>} promise that resolves when the wait is over.
 */
async function wait(duration) {
	return new Promise((resolve) => {
		setTimeout(() => {
		resolve();
		}, duration);
	});
}