import { json } from '@sveltejs/kit';
import { submitPicks } from '$lib/server/rooms';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params }) => {
	const body = await request.json().catch(() => ({}));
	const { playerId, roundIndex, picks } = body;

	if (!playerId) return json({ error: 'playerId is required.' }, { status: 400 });

	const err = submitPicks(
		params.code,
		String(playerId),
		Number(roundIndex),
		Array.isArray(picks) ? (picks as unknown[]).map(String) : []
	);
	if (err) return json(err, { status: 400 });
	return json({ ok: true });
};
