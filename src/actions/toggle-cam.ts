import { action, KeyAction, KeyUpEvent, SingletonAction } from "@elgato/streamdeck";
import { RestreamState, WebSocketService } from "../websocket-service";

/**
 * Toggle Camera action for Restream Studio.
 */
@action({ UUID: "org.pozil.restream.toggle-cam" })
export class ToggleCam extends SingletonAction {
	
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
			keyAction.setState(state.isCameraEnabled ? 0 : 1)
		});
	}

	override onKeyUp(ev: KeyUpEvent): void {
		this.wsService.sendMessage({ action: 'toggle-cam', context: ev.action.id });
	}
}
