import { json } from '@sveltejs/kit';
import { startGame } from '$lib/server/rooms';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params }) => {
	const body = await request.json().catch(() => ({}));
	const playerId = String(body.playerId ?? '');
	if (!playerId) return json({ error: 'playerId is required.' }, { status: 400 });

	const err = startGame(params.code, playerId);
	if (err) return json(err, { status: 400 });
	return json({ ok: true });
};
