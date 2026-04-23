import type { DishChallenge } from '$lib/game-data';
import { challenges as allChallenges } from '$lib/game-data';
import type {
	PublicRoom,
	PublicPlayer,
	SerializedChallenge,
	PickReveal,
	PlayerRoundResult
} from '$lib/room-types';

export type { PublicRoom, PublicPlayer, SerializedChallenge, PickReveal, PlayerRoundResult };

type Subscriber = (data: string) => void;

interface Player {
	id: string;
	name: string;
	scores: number[]; // health score per round (0-100)
	speedBonuses: number[]; // speed bonus per round (0-20)
	submittedThisRound: boolean;
}

interface Room {
	code: string;
	hostId: string;
	players: Map<string, Player>;
	phase: 'lobby' | 'playing' | 'round_end' | 'finished';
	currentRound: number;
	totalRounds: number;
	challenges: DishChallenge[];
	serializedChallenges: SerializedChallenge[]; // pre-shuffled, no healthScore
	roundStartTime: number;
	roundDuration: number;
	submissions: Map<string, { picks: string[]; submittedAt: number }>;
	subscribers: Set<Subscriber>;
	roundTimer: ReturnType<typeof setTimeout> | null;
	timerInterval: ReturnType<typeof setInterval> | null;
	cleanupTimer: ReturnType<typeof setTimeout> | null;
	roundResults: PlayerRoundResult[];
}

const rooms = new Map<string, Room>();

// ─── utils ────────────────────────────────────────────────────────────────

function genId(): string {
	return Math.random().toString(36).slice(2, 12);
}

function genCode(): string {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	let code = '';
	for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
	return rooms.has(code) ? genCode() : code;
}

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function serializeChallenge(c: DishChallenge): SerializedChallenge {
	return {
		id: c.id,
		title: c.title,
		prompt: c.prompt,
		emoji: c.emoji,
		pickCount: c.pickCount,
		ingredients: shuffle(c.ingredients).map((ing) => ({
			id: ing.id,
			name: ing.name,
			emoji: ing.emoji,
			calories: ing.calories,
			category: ing.category
		}))
	};
}

function toPublicPlayer(p: Player): PublicPlayer {
	return {
		id: p.id,
		name: p.name,
		totalScore: p.scores.reduce((sum, s, i) => sum + s + (p.speedBonuses[i] ?? 0), 0),
		roundScores: p.scores.map((s, i) => s + (p.speedBonuses[i] ?? 0)),
		submittedThisRound: p.submittedThisRound
	};
}

export function toPublicRoom(room: Room): PublicRoom {
	return {
		code: room.code,
		hostId: room.hostId,
		phase: room.phase,
		currentRound: room.currentRound,
		totalRounds: room.totalRounds,
		players: [...room.players.values()].map(toPublicPlayer),
		challenge:
			room.phase === 'playing' || room.phase === 'round_end'
				? (room.serializedChallenges[room.currentRound] ?? null)
				: null,
		roundResults: room.roundResults
	};
}

function broadcast(room: Room, message: object) {
	const data = `data: ${JSON.stringify(message)}\n\n`;
	const dead: Subscriber[] = [];
	for (const sub of room.subscribers) {
		try {
			sub(data);
		} catch {
			dead.push(sub);
		}
	}
	dead.forEach((s) => room.subscribers.delete(s));
}

function scheduleCleanup(room: Room) {
	if (room.cleanupTimer) clearTimeout(room.cleanupTimer);
	// Auto-delete rooms after 2 hours of inactivity
	room.cleanupTimer = setTimeout(() => rooms.delete(room.code), 2 * 60 * 60 * 1000);
}

// ─── public API ───────────────────────────────────────────────────────────

export function createRoom(playerName: string): { roomCode: string; playerId: string } {
	const code = genCode();
	const playerId = genId();
	const selectedChallenges = shuffle(allChallenges).slice(0, 5);

	const room: Room = {
		code,
		hostId: playerId,
		players: new Map([
			[
				playerId,
				{
					id: playerId,
					name: playerName,
					scores: [],
					speedBonuses: [],
					submittedThisRound: false
				}
			]
		]),
		phase: 'lobby',
		currentRound: 0,
		totalRounds: 5,
		challenges: selectedChallenges,
		serializedChallenges: selectedChallenges.map(serializeChallenge),
		roundStartTime: 0,
		roundDuration: 60,
		submissions: new Map(),
		subscribers: new Set(),
		roundTimer: null,
		timerInterval: null,
		cleanupTimer: null,
		roundResults: []
	};

	rooms.set(code, room);
	scheduleCleanup(room);
	return { roomCode: code, playerId };
}

export function joinRoom(
	code: string,
	playerName: string
): { playerId: string } | { error: string } {
	const room = rooms.get(code.toUpperCase().trim());
	if (!room) return { error: 'Room not found. Check the code and try again.' };
	if (room.phase !== 'lobby') return { error: 'Game has already started.' };
	if (room.players.size >= 8) return { error: 'Room is full (max 8 players).' };

	const playerId = genId();
	room.players.set(playerId, {
		id: playerId,
		name: playerName,
		scores: [],
		speedBonuses: [],
		submittedThisRound: false
	});

	broadcast(room, { type: 'room_update', room: toPublicRoom(room) });
	return { playerId };
}

export function startGame(code: string, playerId: string): null | { error: string } {
	const room = rooms.get(code);
	if (!room) return { error: 'Room not found.' };
	if (room.hostId !== playerId) return { error: 'Only the host can start the game.' };
	if (room.phase !== 'lobby') return { error: 'Game has already started.' };

	room.phase = 'playing';
	room.currentRound = 0;
	room.submissions.clear();
	room.roundResults = [];
	for (const p of room.players.values()) p.submittedThisRound = false;
	room.roundStartTime = Date.now();

	broadcast(room, { type: 'game_started', room: toPublicRoom(room) });
	startRoundTimer(room);
	scheduleCleanup(room);
	return null;
}

export function submitPicks(
	code: string,
	playerId: string,
	roundIndex: number,
	picks: string[]
): null | { error: string } {
	const room = rooms.get(code);
	if (!room) return { error: 'Room not found.' };
	if (room.phase !== 'playing') return { error: 'Round is not active.' };
	if (room.currentRound !== roundIndex) return { error: 'Wrong round index.' };

	const player = room.players.get(playerId);
	if (!player) return { error: 'Player not in room.' };
	if (player.submittedThisRound) return { error: 'Already submitted this round.' };

	const challenge = room.challenges[room.currentRound];
	const validIds = new Set(challenge.ingredients.map((i) => i.id));
	const cleanPicks = picks
		.filter((id) => validIds.has(id))
		.slice(0, challenge.pickCount);

	room.submissions.set(playerId, { picks: cleanPicks, submittedAt: Date.now() });
	player.submittedThisRound = true;

	broadcast(room, { type: 'player_submitted', playerId, room: toPublicRoom(room) });

	if ([...room.players.values()].every((p) => p.submittedThisRound)) {
		clearTimeout(room.roundTimer!);
		clearInterval(room.timerInterval!);
		endRound(room);
	}

	return null;
}

export function subscribeToRoom(code: string, sub: Subscriber): PublicRoom | null {
	const room = rooms.get(code);
	if (!room) return null;
	room.subscribers.add(sub);
	return toPublicRoom(room);
}

export function unsubscribeFromRoom(code: string, sub: Subscriber): void {
	rooms.get(code)?.subscribers.delete(sub);
}

// ─── internal ─────────────────────────────────────────────────────────────

function startRoundTimer(room: Room) {
	if (room.roundTimer) clearTimeout(room.roundTimer);
	if (room.timerInterval) clearInterval(room.timerInterval);

	room.roundTimer = setTimeout(() => endRound(room), room.roundDuration * 1000);

	room.timerInterval = setInterval(() => {
		if (room.phase !== 'playing') {
			clearInterval(room.timerInterval!);
			return;
		}
		const elapsed = (Date.now() - room.roundStartTime) / 1000;
		const remaining = Math.max(0, Math.round(room.roundDuration - elapsed));
		broadcast(room, { type: 'timer', remaining });
	}, 1000);
}

function endRound(room: Room) {
	if (room.phase !== 'playing') return;
	if (room.roundTimer) clearTimeout(room.roundTimer);
	if (room.timerInterval) clearInterval(room.timerInterval);

	const challenge = room.challenges[room.currentRound];
	const maxScore = [...challenge.ingredients]
		.map((i) => i.healthScore)
		.sort((a, b) => b - a)
		.slice(0, challenge.pickCount)
		.reduce((sum, s) => sum + s, 0);

	const results: PlayerRoundResult[] = [];

	for (const player of room.players.values()) {
		const sub = room.submissions.get(player.id);
		const picks = sub?.picks ?? [];
		const submittedAt = sub?.submittedAt ?? room.roundStartTime + room.roundDuration * 1000;

		const userScore = picks.reduce((sum, id) => {
			const ing = challenge.ingredients.find((i) => i.id === id);
			return sum + (ing?.healthScore ?? 0);
		}, 0);

		const healthScore = maxScore > 0 ? Math.round((userScore / maxScore) * 100) : 0;
		const timeUsed = Math.min((submittedAt - room.roundStartTime) / 1000, room.roundDuration);
		const timeRemaining = Math.max(0, room.roundDuration - timeUsed);
		const speedBonus = Math.round((timeRemaining / room.roundDuration) * 20);

		player.scores.push(healthScore);
		player.speedBonuses.push(speedBonus);
		player.submittedThisRound = false;

		results.push({
			playerId: player.id,
			playerName: player.name,
			picks: picks.map((id) => {
				const ing = challenge.ingredients.find((i) => i.id === id)!;
				return {
					id: ing.id,
					name: ing.name,
					emoji: ing.emoji,
					healthScore: ing.healthScore,
					benefit: ing.benefit,
					category: ing.category
				};
			}),
			healthScore,
			speedBonus,
			roundTotal: healthScore + speedBonus
		});
	}

	results.sort((a, b) => b.roundTotal - a.roundTotal);
	room.roundResults = results;
	room.phase = 'round_end';

	const optimalPicks: PickReveal[] = [...challenge.ingredients]
		.sort((a, b) => b.healthScore - a.healthScore)
		.slice(0, challenge.pickCount)
		.map((ing) => ({
			id: ing.id,
			name: ing.name,
			emoji: ing.emoji,
			healthScore: ing.healthScore,
			benefit: ing.benefit,
			category: ing.category
		}));

	broadcast(room, {
		type: 'round_end',
		roundIndex: room.currentRound,
		results,
		optimalPicks,
		room: toPublicRoom(room)
	});

	// Advance to next round (or end) after 8 seconds
	setTimeout(() => {
		room.currentRound++;
		if (room.currentRound >= room.totalRounds) {
			room.phase = 'finished';
			broadcast(room, { type: 'game_over', room: toPublicRoom(room) });
		} else {
			room.phase = 'playing';
			room.roundStartTime = Date.now();
			room.submissions.clear();
			room.roundResults = [];
			for (const p of room.players.values()) p.submittedThisRound = false;
			broadcast(room, { type: 'new_round', room: toPublicRoom(room) });
			startRoundTimer(room);
		}
	}, 8000);
}
