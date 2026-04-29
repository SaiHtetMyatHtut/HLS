import type { DishChallenge } from '$lib/game-data';
import { challenges as allChallenges } from '$lib/game-data';
import type {
	PublicRoom,
	PublicPlayer,
	SerializedChallenge,
	PickReveal,
	PlayerRoundResult
} from '$lib/room-types';
import { supabaseAdmin } from '$lib/server/supabase';

export type { PublicRoom, PublicPlayer, SerializedChallenge, PickReveal, PlayerRoundResult };

interface Player {
	id: string;
	name: string;
	scores: number[];
	speedBonuses: number[];
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
	serializedChallenges: SerializedChallenge[];
	roundStartTime: number;
	roundDuration: number;
	submissions: Map<string, { picks: string[]; submittedAt: number }>;
	roundTimer: ReturnType<typeof setTimeout> | null;
	cleanupTimer: ReturnType<typeof setTimeout> | null;
	// Stored for DB sync at round end
	lastRoundResults: PlayerRoundResult[] | null;
	lastOptimalPicks: PickReveal[] | null;
}

// In-memory map is kept solely for timer management.
// Supabase DB is the source of truth for clients.
// NOTE: On serverless deployments timers won't survive cold starts — use a
// dedicated server (adapter-node) or Supabase Edge Functions for production.
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

// ─── Supabase sync ────────────────────────────────────────────────────────
// Writes the current room state to DB, which triggers Realtime to notify clients.

async function syncToSupabase(room: Room): Promise<void> {
	const roundResults =
		room.lastRoundResults && room.lastOptimalPicks
			? { playerResults: room.lastRoundResults, optimalPicks: room.lastOptimalPicks }
			: null;

	const roomUpsert = supabaseAdmin.from('rooms').upsert({
		code: room.code,
		host_player_id: room.hostId,
		phase: room.phase,
		current_round: room.currentRound,
		total_rounds: room.totalRounds,
		serialized_challenges: room.serializedChallenges,
		round_start_time: room.roundStartTime,
		round_duration: room.roundDuration,
		round_results: roundResults
	});

	const players = [...room.players.values()].map((p) => ({
		id: p.id,
		room_code: room.code,
		name: p.name,
		scores: p.scores,
		speed_bonuses: p.speedBonuses,
		submitted_this_round: p.submittedThisRound
	}));

	// Run both in parallel; errors are non-fatal (game continues in memory)
	const [roomResult, playersResult] = await Promise.all([
		roomUpsert,
		players.length > 0 ? supabaseAdmin.from('room_players').upsert(players) : null
	]);
	if (roomResult.error) console.error('[rooms] DB sync (rooms):', roomResult.error.message);
	if (playersResult?.error)
		console.error('[rooms] DB sync (players):', playersResult.error.message);
}

function scheduleCleanup(room: Room) {
	if (room.cleanupTimer) clearTimeout(room.cleanupTimer);
	room.cleanupTimer = setTimeout(async () => {
		rooms.delete(room.code);
		// Remove from DB too
		await supabaseAdmin.from('rooms').delete().eq('code', room.code);
	}, 2 * 60 * 60 * 1000);
}

// ─── public API ───────────────────────────────────────────────────────────

export async function createRoom(
	playerName: string
): Promise<{ roomCode: string; playerId: string }> {
	const code = genCode();
	const playerId = genId();
	const selectedChallenges = shuffle(allChallenges).slice(0, 5);

	const room: Room = {
		code,
		hostId: playerId,
		players: new Map([
			[
				playerId,
				{ id: playerId, name: playerName, scores: [], speedBonuses: [], submittedThisRound: false }
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
		roundTimer: null,
		cleanupTimer: null,
		lastRoundResults: null,
		lastOptimalPicks: null
	};

	rooms.set(code, room);
	await syncToSupabase(room);
	scheduleCleanup(room);
	return { roomCode: code, playerId };
}

export async function joinRoom(
	code: string,
	playerName: string
): Promise<{ playerId: string } | { error: string }> {
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

	await syncToSupabase(room);
	return { playerId };
}

export async function startGame(
	code: string,
	playerId: string
): Promise<null | { error: string }> {
	const room = rooms.get(code);
	if (!room) return { error: 'Room not found.' };
	if (room.hostId !== playerId) return { error: 'Only the host can start the game.' };
	if (room.phase !== 'lobby') return { error: 'Game has already started.' };

	room.phase = 'playing';
	room.currentRound = 0;
	room.submissions.clear();
	room.lastRoundResults = null;
	room.lastOptimalPicks = null;
	for (const p of room.players.values()) p.submittedThisRound = false;
	room.roundStartTime = Date.now();

	await syncToSupabase(room);
	startRoundTimer(room);
	scheduleCleanup(room);
	return null;
}

export async function submitPicks(
	code: string,
	playerId: string,
	roundIndex: number,
	picks: string[]
): Promise<null | { error: string }> {
	const room = rooms.get(code);
	if (!room) return { error: 'Room not found.' };
	if (room.phase !== 'playing') return { error: 'Round is not active.' };
	if (room.currentRound !== roundIndex) return { error: 'Wrong round index.' };

	const player = room.players.get(playerId);
	if (!player) return { error: 'Player not in room.' };
	if (player.submittedThisRound) return { error: 'Already submitted this round.' };

	const challenge = room.challenges[room.currentRound];
	const validIds = new Set(challenge.ingredients.map((i) => i.id));
	const cleanPicks = picks.filter((id) => validIds.has(id)).slice(0, challenge.pickCount);

	room.submissions.set(playerId, { picks: cleanPicks, submittedAt: Date.now() });
	player.submittedThisRound = true;

	// Sync submission flag so clients see the "submitted" indicator
	await syncToSupabase(room);

	// Also persist the submission itself
	await supabaseAdmin.from('room_submissions').upsert({
		room_code: code,
		player_id: playerId,
		round_index: roundIndex,
		picks: cleanPicks,
		submitted_at: Date.now()
	});

	if ([...room.players.values()].every((p) => p.submittedThisRound)) {
		clearTimeout(room.roundTimer!);
		await endRound(room);
	}

	return null;
}

// ─── internal ─────────────────────────────────────────────────────────────

function startRoundTimer(room: Room) {
	if (room.roundTimer) clearTimeout(room.roundTimer);
	room.roundTimer = setTimeout(() => endRound(room), room.roundDuration * 1000);
}

async function endRound(room: Room) {
	if (room.phase !== 'playing') return;
	if (room.roundTimer) clearTimeout(room.roundTimer);

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

	room.phase = 'round_end';
	room.lastRoundResults = results;
	room.lastOptimalPicks = optimalPicks;

	// Sync round_end state — Realtime will push to clients
	await syncToSupabase(room);

}

export async function advanceRound(
	code: string,
	playerId: string
): Promise<null | { error: string }> {
	const room = rooms.get(code);
	if (!room) return { error: 'Room not found.' };
	if (room.hostId !== playerId) return { error: 'Only the host can advance rounds.' };
	if (room.phase !== 'round_end') return { error: 'Round has not ended yet.' };

	room.currentRound++;
	if (room.currentRound >= room.totalRounds) {
		room.phase = 'finished';
	} else {
		room.phase = 'playing';
		room.roundStartTime = Date.now();
		room.submissions.clear();
		room.lastRoundResults = null;
		room.lastOptimalPicks = null;
		for (const p of room.players.values()) p.submittedThisRound = false;
		startRoundTimer(room);
	}
	await syncToSupabase(room);
	return null;
}
