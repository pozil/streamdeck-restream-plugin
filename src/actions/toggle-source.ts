import { action, DidReceiveSettingsEvent, KeyAction, KeyUpEvent, SingletonAction } from "@elgato/streamdeck";
import { RestreamState, WebSocketService } from "../websocket-service";

type ToggleSourceSettings = {
	index?: number;
	indexString?: string;
};

/**
 * Toggle Source action for Restream Studio.
 * Switches between camera and screen sharing sources.
 */
@action({ UUID: "org.pozil.restream.toggle-source" })
export class ToggleSource extends SingletonAction<ToggleSourceSettings> {

	wsService: WebSocketService;

	constructor(wsService: WebSocketService) {
		super();
		this.wsService = wsService;
		this.wsService.registerStateChangeHandler(state => {
			this.handleStateChange(state);
		});
	}

	private handleStateChange(state: RestreamState): void {
		const { sources } = state;
		
		this.actions.forEach(async action => {
			const keyAction = action as KeyAction;
			const settings = (await keyAction.getSettings() as ToggleSourceSettings);
			const index = settings.index ?? 0;
			if (index < sources.length) {
				const { type, label, isActive } = sources[index];
				let state;
				if (type === 'Screen share') {
					state = isActive ? 2 : 3;
				} else {
					state = isActive ? 0 : 1;
				}
				keyAction.setState(state);
				keyAction.setTitle(label);
			} else {
				keyAction.setState(0);
				keyAction.setTitle('Unknown');
			}
		});
	}

	override onDidReceiveSettings(ev: DidReceiveSettingsEvent<ToggleSourceSettings>): Promise<void> | void {
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

	override onKeyUp(ev: KeyUpEvent<ToggleSourceSettings>): void {
		const index = ev.payload.settings.index ?? 0;
		this.wsService.sendMessage({ action: 'toggle-source', context: ev.action.id, index });
	}
}
