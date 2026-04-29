import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// SSE stream replaced by Supabase Realtime — clients subscribe directly to Supabase.
export const GET: RequestHandler = () => {
	return json({ error: 'SSE stream is no longer used. Subscribe via Supabase Realtime.' }, { status: 410 });
};
