// Shared types between server (rooms.ts) and client (multiplayer.svelte.ts).
// Must NOT import from $lib/server/* — this file is used on both sides.

export interface PublicPlayer {
	id: string;
	name: string;
	totalScore: number;
	roundScores: number[]; // healthScore + speedBonus per completed round
	submittedThisRound: boolean;
}

export interface SerializedIngredient {
	id: string;
	name: string;
	emoji: string;
	calories: number;
	category: string;
	// healthScore / benefit intentionally omitted to prevent cheating
}

export interface SerializedChallenge {
	id: string;
	title: string;
	prompt: string;
	emoji: string;
	pickCount: number;
	ingredients: SerializedIngredient[];
}

export interface PickReveal {
	id: string;
	name: string;
	emoji: string;
	healthScore: number;
	benefit: string;
	category: string;
}

export interface PlayerRoundResult {
	playerId: string;
	playerName: string;
	picks: PickReveal[];
	healthScore: number; // 0-100
	speedBonus: number; // 0-20
	roundTotal: number;
}

export interface PublicRoom {
	code: string;
	hostId: string;
	phase: 'lobby' | 'playing' | 'round_end' | 'finished';
	currentRound: number;
	totalRounds: number;
	players: PublicPlayer[];
	challenge: SerializedChallenge | null;
	roundResults: PlayerRoundResult[];
}

// SSE event union
export type ServerEvent =
	| { type: 'room_update'; room: PublicRoom }
	| { type: 'game_started'; room: PublicRoom }
	| { type: 'player_submitted'; playerId: string; room: PublicRoom }
	| { type: 'round_end'; roundIndex: number; results: PlayerRoundResult[]; optimalPicks: PickReveal[]; room: PublicRoom }
	| { type: 'new_round'; room: PublicRoom }
	| { type: 'game_over'; room: PublicRoom }
	| { type: 'timer'; remaining: number }
	| { type: 'error'; message: string };
