import { action, KeyAction, KeyUpEvent, SingletonAction } from "@elgato/streamdeck";
import { RestreamState, WebSocketService } from "../websocket-service";

/**
 * Toggle Screen Sharing action for Restream Studio.
 */
@action({ UUID: "org.pozil.restream.toggle-share-screen" })
export class ToggleShareScreen extends SingletonAction {

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
			keyAction.setState(state.isSharingScreen ? 0 : 1)
		});
	}

	override onKeyUp(ev: KeyUpEvent): void {
		this.wsService.sendMessage({ action: 'toggle-share-screen', context: ev.action.id });
	}
}
