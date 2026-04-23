import { browser } from '$app/environment';
import type { PublicRoom, PublicPlayer, PlayerRoundResult, PickReveal, ServerEvent } from '$lib/room-types';

const SESSION_CODE = 'mp_roomCode';
const SESSION_PID = 'mp_playerId';

class MultiplayerStore {
	roomCode = $state<string | null>(null);
	playerId = $state<string | null>(null);

	room = $state<PublicRoom | null>(null);
	timeRemaining = $state(60);

	roundResults = $state<PlayerRoundResult[] | null>(null);
	optimalPicks = $state<PickReveal[] | null>(null);

	// Countdown to next round (client-side display only)
	nextRoundIn = $state<number | null>(null);

	connected = $state(false);
	error = $state<string | null>(null);

	private es: EventSource | null = null;
	private nextRoundTimer: ReturnType<typeof setInterval> | null = null;

	// ─── init ──────────────────────────────────────────────────────────────

	init(roomCode: string, playerId: string) {
		this.roomCode = roomCode;
		this.playerId = playerId;
		if (browser) {
			sessionStorage.setItem(SESSION_CODE, roomCode);
			sessionStorage.setItem(SESSION_PID, playerId);
		}
		this.connect();
	}

	restoreFromSession(): boolean {
		if (!browser) return false;
		const code = sessionStorage.getItem(SESSION_CODE);
		const pid = sessionStorage.getItem(SESSION_PID);
		if (code && pid) {
			this.roomCode = code;
			this.playerId = pid;
			this.connect();
			return true;
		}
		return false;
	}

	clearSession() {
		if (browser) {
			sessionStorage.removeItem(SESSION_CODE);
			sessionStorage.removeItem(SESSION_PID);
		}
		this.es?.close();
		this.es = null;
		this.roomCode = null;
		this.playerId = null;
		this.room = null;
		this.connected = false;
		this.error = null;
	}

	// ─── connection ────────────────────────────────────────────────────────

	private connect() {
		if (!browser || !this.roomCode) return;
		this.es?.close();

		this.es = new EventSource(`/api/room/${this.roomCode}/stream`);

		this.es.onopen = () => {
			this.connected = true;
			this.error = null;
		};

		this.es.onerror = () => {
			this.connected = false;
			// Attempt reconnect after 2s
			setTimeout(() => {
				if (this.roomCode) this.connect();
			}, 2000);
		};

		this.es.onmessage = (e) => {
			try {
				const msg: ServerEvent = JSON.parse(e.data);
				this.handle(msg);
			} catch {
				// malformed event — ignore
			}
		};
	}

	private handle(msg: ServerEvent) {
		switch (msg.type) {
			case 'room_update':
			case 'game_started':
			case 'player_submitted':
			case 'game_over':
				this.room = msg.room;
				break;

			case 'new_round':
				this.room = msg.room;
				this.roundResults = null;
				this.optimalPicks = null;
				this.timeRemaining = 60;
				this.stopNextRoundCountdown();
				break;

			case 'round_end':
				this.room = msg.room;
				this.roundResults = msg.results;
				this.optimalPicks = msg.optimalPicks;
				this.startNextRoundCountdown(8);
				break;

			case 'timer':
				this.timeRemaining = msg.remaining;
				break;

			case 'error':
				this.error = msg.message;
				break;
		}
	}

	private startNextRoundCountdown(seconds: number) {
		this.stopNextRoundCountdown();
		this.nextRoundIn = seconds;
		this.nextRoundTimer = setInterval(() => {
			if (this.nextRoundIn !== null && this.nextRoundIn > 0) {
				this.nextRoundIn--;
			} else {
				this.stopNextRoundCountdown();
			}
		}, 1000);
	}

	private stopNextRoundCountdown() {
		if (this.nextRoundTimer) {
			clearInterval(this.nextRoundTimer);
			this.nextRoundTimer = null;
		}
		this.nextRoundIn = null;
	}

	// ─── actions ───────────────────────────────────────────────────────────

	async createRoom(playerName: string): Promise<{ roomCode?: string; error?: string }> {
		const res = await fetch('/api/room', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ playerName })
		});
		const data = await res.json();
		if (data.error) return { error: data.error };
		this.init(data.roomCode, data.playerId);
		return { roomCode: data.roomCode };
	}

	async joinRoom(
		code: string,
		playerName: string
	): Promise<{ roomCode?: string; error?: string }> {
		const res = await fetch(`/api/room/${code.toUpperCase().trim()}/join`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ playerName })
		});
		const data = await res.json();
		if (data.error) return { error: data.error };
		this.init(code.toUpperCase().trim(), data.playerId);
		return { roomCode: code.toUpperCase().trim() };
	}

	async startGame(): Promise<{ error?: string }> {
		if (!this.roomCode || !this.playerId) return { error: 'Not connected.' };
		const res = await fetch(`/api/room/${this.roomCode}/start`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ playerId: this.playerId })
		});
		return res.json();
	}

	async submitPicks(picks: string[]): Promise<{ error?: string }> {
		if (!this.roomCode || !this.playerId || !this.room) return { error: 'Not connected.' };
		const res = await fetch(`/api/room/${this.roomCode}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				playerId: this.playerId,
				roundIndex: this.room.currentRound,
				picks
			})
		});
		return res.json();
	}

	// ─── derived helpers ───────────────────────────────────────────────────

	get myPlayer(): PublicPlayer | null {
		return this.room?.players.find((p) => p.id === this.playerId) ?? null;
	}

	get isHost(): boolean {
		return this.room?.hostId === this.playerId;
	}

	get submittedThisRound(): boolean {
		return this.myPlayer?.submittedThisRound ?? false;
	}

	get myRoundResult(): PlayerRoundResult | null {
		return this.roundResults?.find((r) => r.playerId === this.playerId) ?? null;
	}
}

export const mp = new MultiplayerStore();
