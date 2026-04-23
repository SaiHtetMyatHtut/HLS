import { json } from '@sveltejs/kit';
import { createRoom } from '$lib/server/rooms';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => ({}));
	const playerName = String(body.playerName ?? '').trim().slice(0, 30);
	if (!playerName) return json({ error: 'Player name is required.' }, { status: 400 });

	const result = createRoom(playerName);
	return json(result);
};
