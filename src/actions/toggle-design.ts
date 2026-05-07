import { action, DidReceiveSettingsEvent, KeyAction, KeyUpEvent, SingletonAction } from "@elgato/streamdeck";
import { RestreamState, WebSocketService } from "../websocket-service";

type ToggleDesignSettings = {
	type: 'overlay' | 'video' | 'background';
	index?: number;
	indexString?: string;
};

/**
 * Toggle Design action for Restream Studio.
 * Controls overlays, video clips, and backgrounds.
 */
@action({ UUID: "org.pozil.restream.toggle-design" })
export class ToggleDesign extends SingletonAction<ToggleDesignSettings> {

	wsService: WebSocketService;

	constructor(wsService: WebSocketService) {
		super();
		this.wsService = wsService;
		this.wsService.registerStateChangeHandler(state => {
			this.handleStateChange(state);
		});
	}

	private handleStateChange(state: RestreamState): void {
		const { activeOverlayIndex, activeVideoClipIndex, activeBackgroundIndex } = state;
		
		this.actions.forEach(async action => {
			const keyAction = action as KeyAction;
			const settings = (await keyAction.getSettings() as ToggleDesignSettings);
			let isActive = false;
			switch (settings.type) {
				case 'overlay':
					isActive = (activeOverlayIndex === settings.index);
				break;
				case 'video':
					isActive = (activeVideoClipIndex === settings.index);
				break;
				case 'background':
					isActive = (activeBackgroundIndex === settings.index);
				break;
			}
			keyAction.setState(isActive ? 1 : 0);
		});
	}

	override onDidReceiveSettings(ev: DidReceiveSettingsEvent<ToggleDesignSettings>): Promise<void> | void {
		// Sanitize settings values
		const { settings } = ev.payload;
		let newIndex;
		if (settings.indexString)
			newIndex = Number.parseInt(settings.indexString, 10);
		else
			newIndex = 0;
		if (settings.index !== newIndex) {
			settings.index = newIndex;
			ev.action.setSettings(settings);
		}
	}

	override onKeyUp(ev: KeyUpEvent<ToggleDesignSettings>): void {
		const { type, index } = ev.payload.settings;
		this.wsService.sendMessage({ action: 'toggle-design', context: ev.action.id, type, index });
	}
}
