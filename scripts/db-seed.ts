/**
 * Seeds the leaderboard with starter entries so the page isn't empty on first run.
 * Run after db:setup:
 *   npm run db:seed
 */

import { config } from 'dotenv';
config();

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const SEED_ENTRIES = [
	{ name: 'Alex Chen',    score: 487, played_at: '2026-04-20' },
	{ name: 'Sam Rivera',   score: 463, played_at: '2026-04-21' },
	{ name: 'Jordan Kim',   score: 445, played_at: '2026-04-19' },
	{ name: 'Taylor Pham',  score: 428, played_at: '2026-04-22' },
	{ name: 'Morgan Liu',   score: 412, played_at: '2026-04-18' },
	{ name: 'Casey Walsh',  score: 389, played_at: '2026-04-17' },
	{ name: 'Jamie Park',   score: 361, played_at: '2026-04-15' },
	{ name: 'Riley Scott',  score: 340, played_at: '2026-04-14' }
];

async function main() {
	console.log('🌱  Seeding leaderboard…');
	const client = await pool.connect();
	try {
		// Only seed if table is empty to avoid duplicating entries on re-runs
		const { rows } = await client.query('SELECT COUNT(*) FROM leaderboard');
		if (parseInt(rows[0].count) > 0) {
			console.log('ℹ️   Leaderboard already has entries — skipping seed. Use db:reset to start fresh.');
			return;
		}

		for (const entry of SEED_ENTRIES) {
			await client.query(
				'INSERT INTO leaderboard (name, score, played_at) VALUES ($1, $2, $3)',
				[entry.name, entry.score, entry.played_at]
			);
		}
		console.log(`✅  Seeded ${SEED_ENTRIES.length} leaderboard entries.`);
	} catch (err) {
		console.error('❌  Seed failed:', err);
		process.exit(1);
	} finally {
		client.release();
		await pool.end();
	}
}

main();
