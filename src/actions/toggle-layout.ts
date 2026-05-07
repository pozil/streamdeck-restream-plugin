import { action, DidReceiveSettingsEvent, KeyAction, KeyUpEvent, SingletonAction } from "@elgato/streamdeck";
import { RestreamState, WebSocketService } from "../websocket-service";

type ToggleLayoutSettings = {
	layoutIndex: number;
};

/**
 * Toggle Layout action for Restream Studio.
 * Switches between different layout options (Showtime, Contain, Cover, etc.).
 */
@action({ UUID: "org.pozil.restream.toggle-layout" })
export class ToggleLayout extends SingletonAction<ToggleLayoutSettings> {

	wsService: WebSocketService;
	lastActiveLayoutIndex? : number;

	constructor(wsService: WebSocketService) {
		super();
		this.wsService = wsService;
		this.wsService.registerStateChangeHandler(state => {
			this.handleStateChange(state);
		});
	}

	private handleStateChange(state: RestreamState): void {
		const { activeLayoutIndex } = state;

		// Ignore state change if we're still on the same layout
		if (activeLayoutIndex === this.lastActiveLayoutIndex)
			return;
		// Save active layout
		this.lastActiveLayoutIndex = activeLayoutIndex;
		
		this.actions.forEach(async action => {
			const keyAction = action as KeyAction;
			const settings = (await keyAction.getSettings() as ToggleLayoutSettings);
			const setLayoutIndex = settings.layoutIndex;
			const newState = setLayoutIndex + (setLayoutIndex === activeLayoutIndex ? 6 : 0);
			keyAction.setState(newState);
		});
	}

	override onDidReceiveSettings(ev: DidReceiveSettingsEvent<ToggleLayoutSettings>): Promise<void> | void {
		// Update state when settings change
		const { layoutIndex } = ev.payload.settings;
		const newState = layoutIndex + (layoutIndex === this.lastActiveLayoutIndex ? 6 : 0);
		(ev.action as KeyAction).setState(newState);
	}

	override onKeyUp(ev: KeyUpEvent<ToggleLayoutSettings>): void {
		const index = ev.payload.settings.layoutIndex;
		this.wsService.sendMessage({ action: 'toggle-layout', context: ev.action.id, index });
	}
}
