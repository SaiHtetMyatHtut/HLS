import { json } from '@sveltejs/kit';
import { advanceRound } from '$lib/server/rooms';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params }) => {
	const body = await request.json().catch(() => ({}));
	const playerId = String(body.playerId ?? '');
	if (!playerId) return json({ error: 'playerId required.' }, { status: 400 });

	const result = await advanceRound(params.code, playerId);
	if (result && 'error' in result) return json(result, { status: 400 });
	return json({ ok: true });
};
