import { browser } from '$app/environment';
import { supabase } from '$lib/supabase';
import type {
	PublicRoom,
	PublicPlayer,
	SerializedChallenge,
	PlayerRoundResult,
	PickReveal
} from '$lib/room-types';
import type { RealtimeChannel } from '@supabase/supabase-js';

const SESSION_CODE = 'mp_roomCode';
const SESSION_PID = 'mp_playerId';

// ─── DB row shapes ────────────────────────────────────────────────────────

interface RoomRow {
	code: string;
	host_player_id: string;
	phase: string;
	current_round: number;
	total_rounds: number;
	serialized_challenges: SerializedChallenge[];
	round_start_time: number | null;
	round_duration: number;
	round_results: { playerResults: PlayerRoundResult[]; optimalPicks: PickReveal[] } | null;
}

interface PlayerRow {
	id: string;
	room_code: string;
	name: string;
	scores: number[];
	speed_bonuses: number[];
	submitted_this_round: boolean;
}

// ─── Store ────────────────────────────────────────────────────────────────

class MultiplayerStore {
	roomCode = $state<string | null>(null);
	playerId = $state<string | null>(null);

	room = $state<PublicRoom | null>(null);
	timeRemaining = $state(60);

	roundResults = $state<PlayerRoundResult[] | null>(null);
	optimalPicks = $state<PickReveal[] | null>(null);
	nextRoundIn = $state<number | null>(null);

	connected = $state(false);
	error = $state<string | null>(null);

	private channel: RealtimeChannel | null = null;
	private roomRow: RoomRow | null = null;
	private playersMap = new Map<string, PlayerRow>();
	private prevPhase: string | null = null;

	private timerInterval: ReturnType<typeof setInterval> | null = null;
	private nextRoundTimer: ReturnType<typeof setInterval> | null = null;

	// ─── init ────────────────────────────────────────────────────────────

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
		this.channel?.unsubscribe();
		this.channel = null;
		this.stopLocalTimer();
		this.stopNextRoundCountdown();
		this.roomCode = null;
		this.playerId = null;
		this.room = null;
		this.roomRow = null;
		this.playersMap.clear();
		this.prevPhase = null;
		this.connected = false;
		this.error = null;
		this.roundResults = null;
		this.optimalPicks = null;
	}

	// ─── Realtime connection ─────────────────────────────────────────────

	private async connect() {
		if (!browser || !this.roomCode) return;

		// Unsubscribe from any previous channel
		this.channel?.unsubscribe();

		// 1. Fetch current state from DB
		await this.fetchInitialState();

		// 2. Subscribe to Realtime changes
		this.channel = supabase
			.channel(`room:${this.roomCode}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'rooms',
					filter: `code=eq.${this.roomCode}`
				},
				(payload) => {
					if (payload.new && Object.keys(payload.new).length > 0) {
						this.handleRoomChange(payload.new as RoomRow);
					}
				}
			)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'room_players',
					filter: `room_code=eq.${this.roomCode}`
				},
				(payload) => {
					this.handlePlayerChange(payload);
				}
			)
			.subscribe((status) => {
				this.connected = status === 'SUBSCRIBED';
				if (status === 'CHANNEL_ERROR') {
					this.error = 'Connection error — retrying…';
					setTimeout(() => this.connect(), 3000);
				}
			});
	}

	private async fetchInitialState() {
		const [roomRes, playersRes] = await Promise.all([
			supabase.from('rooms').select('*').eq('code', this.roomCode!).single(),
			supabase.from('room_players').select('*').eq('room_code', this.roomCode!)
		]);

		if (roomRes.error || !roomRes.data) {
			this.error = 'Room not found.';
			return;
		}

		this.roomRow = roomRes.data as RoomRow;
		this.playersMap = new Map(
			(playersRes.data ?? []).map((p) => [p.id, p as PlayerRow])
		);
		this.rebuildPublicRoom();
		this.applyPhaseTransition(null, this.roomRow.phase);
		this.prevPhase = this.roomRow.phase;
	}

	private handleRoomChange(newRow: RoomRow) {
		const prevPhase = this.prevPhase;
		this.roomRow = newRow;
		this.rebuildPublicRoom();
		this.applyPhaseTransition(prevPhase, newRow.phase);
		this.prevPhase = newRow.phase;
	}

	private handlePlayerChange(
		payload: { eventType: string; new: object; old: object }
	) {
		if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
			const p = payload.new as PlayerRow;
			this.playersMap.set(p.id, p);
		} else if (payload.eventType === 'DELETE') {
			const p = payload.old as PlayerRow;
			this.playersMap.delete(p.id);
		}
		this.rebuildPublicRoom();
	}

	private rebuildPublicRoom() {
		if (!this.roomRow) return;

		const players: PublicPlayer[] = [...this.playersMap.values()].map((p) => ({
			id: p.id,
			name: p.name,
			totalScore: p.scores.reduce(
				(sum: number, s: number, i: number) => sum + s + (p.speed_bonuses[i] ?? 0),
				0
			),
			roundScores: p.scores.map(
				(s: number, i: number) => s + (p.speed_bonuses[i] ?? 0)
			),
			submittedThisRound: p.submitted_this_round
		}));

		const challenges = this.roomRow.serialized_challenges as SerializedChallenge[];
		const phase = this.roomRow.phase as PublicRoom['phase'];
		const challenge =
			phase === 'playing' || phase === 'round_end'
				? (challenges[this.roomRow.current_round] ?? null)
				: null;

		const roundResults = this.roomRow.round_results?.playerResults ?? [];

		this.room = {
			code: this.roomRow.code,
			hostId: this.roomRow.host_player_id,
			phase,
			currentRound: this.roomRow.current_round,
			totalRounds: this.roomRow.total_rounds,
			players,
			challenge,
			roundResults
		};
	}

	private applyPhaseTransition(prevPhase: string | null, newPhase: string) {
		if (newPhase === 'playing') {
			// Clear any leftover round results
			this.roundResults = null;
			this.optimalPicks = null;
			this.stopNextRoundCountdown();
			// Start local timer
			if (this.roomRow?.round_start_time) {
				this.startLocalTimer(this.roomRow.round_start_time, this.roomRow.round_duration);
			}
		} else if (newPhase === 'round_end') {
			this.stopLocalTimer();
			// Extract results and optimal picks from the DB row
			if (this.roomRow?.round_results) {
				this.roundResults = this.roomRow.round_results.playerResults;
				this.optimalPicks = this.roomRow.round_results.optimalPicks;
			}
			// Show 8-second countdown before next round
			this.startNextRoundCountdown(8);
		} else if (newPhase === 'finished') {
			this.stopLocalTimer();
			this.stopNextRoundCountdown();
		}
	}

	// ─── Local timer (computes timeRemaining from round_start_time) ──────

	private startLocalTimer(roundStartTime: number, roundDuration: number) {
		this.stopLocalTimer();
		this.timerInterval = setInterval(() => {
			const elapsed = (Date.now() - roundStartTime) / 1000;
			this.timeRemaining = Math.max(0, Math.round(roundDuration - elapsed));
		}, 500);
	}

	private stopLocalTimer() {
		if (this.timerInterval) {
			clearInterval(this.timerInterval);
			this.timerInterval = null;
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

	// ─── actions ─────────────────────────────────────────────────────────

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

	// ─── derived helpers ──────────────────────────────────────────────────

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
