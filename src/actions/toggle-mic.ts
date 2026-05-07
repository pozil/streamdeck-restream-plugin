import { action, KeyAction, KeyUpEvent, SingletonAction } from "@elgato/streamdeck";
import { RestreamState, WebSocketService } from "../websocket-service";

/**
 * Toggle Microphone action for Restream Studio.
 */
@action({ UUID: "org.pozil.restream.toggle-mic" })
export class ToggleMic extends SingletonAction {

	wsService: WebSocketService;

	constructor(wsService: WebSocketService) {
		super();
		this.wsService = wsService;
		this.wsService.registerStateChangeHandler(state => {
			this.handleStateChange(state);
		});
	}

	private handleStateChange(state: RestreamState): void {
		this.actions.forEach(action => {
			const keyAction = action as KeyAction;
			keyAction.setState(state.isMicEnabled ? 0 : 1)
		});
	}

	override onKeyUp(ev: KeyUpEvent): void {
		this.wsService.sendMessage({ action: 'toggle-mic', context: ev.action.id });
	}
}
