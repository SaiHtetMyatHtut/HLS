import { json } from '@sveltejs/kit';
import { joinRoom } from '$lib/server/rooms';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params }) => {
	const body = await request.json().catch(() => ({}));
	const playerName = String(body.playerName ?? '').trim().slice(0, 30);
	if (!playerName) return json({ error: 'Player name is required.' }, { status: 400 });

	const result = joinRoom(params.code, playerName);
	if ('error' in result) return json(result, { status: 400 });
	return json(result);
};
