import { subscribeToRoom, unsubscribeFromRoom } from '$lib/server/rooms';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => {
	const encoder = new TextEncoder();
	let cleanup: (() => void) | null = null;

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			const send = (data: string) => {
				try {
					controller.enqueue(encoder.encode(data));
				} catch {
					cleanup?.();
				}
			};

			const initialRoom = subscribeToRoom(params.code, send);
			cleanup = () => unsubscribeFromRoom(params.code, send);

			if (!initialRoom) {
				send(`data: ${JSON.stringify({ type: 'error', message: 'Room not found.' })}\n\n`);
				controller.close();
				return;
			}

			// Send current state immediately on connect
			send(`data: ${JSON.stringify({ type: 'room_update', room: initialRoom })}\n\n`);
		},
		cancel() {
			cleanup?.();
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no'
		}
	});
};
