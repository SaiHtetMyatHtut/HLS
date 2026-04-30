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
	{ name: 'Alex Chen',       score: 487, played_at: '2026-04-20' },
	{ name: 'Sam Rivera',      score: 463, played_at: '2026-04-21' },
	{ name: 'Jordan Kim',      score: 445, played_at: '2026-04-22' },
	{ name: 'Taylor Pham',     score: 428, played_at: '2026-04-22' },
	{ name: 'Morgan Liu',      score: 412, played_at: '2026-04-23' },
	{ name: 'Casey Walsh',     score: 389, played_at: '2026-04-23' },
	{ name: 'Jamie Park',      score: 361, played_at: '2026-04-24' },
	{ name: 'Riley Scott',     score: 340, played_at: '2026-04-24' },
	{ name: 'Avery Brooks',    score: 335, played_at: '2026-04-25' },
	{ name: 'Quinn Foster',    score: 328, played_at: '2026-04-25' },
	{ name: 'Drew Nguyen',     score: 319, played_at: '2026-04-26' },
	{ name: 'Blake Torres',    score: 311, played_at: '2026-04-26' },
	{ name: 'Sage Mitchell',   score: 304, played_at: '2026-04-27' },
	{ name: 'Reese Cooper',    score: 298, played_at: '2026-04-27' },
	{ name: 'Harper Ellis',    score: 291, played_at: '2026-04-28' },
	{ name: 'Logan Ward',      score: 285, played_at: '2026-04-28' },
	{ name: 'Cameron Bell',    score: 279, played_at: '2026-04-29' },
	{ name: 'Finley Hughes',   score: 272, played_at: '2026-04-29' },
	{ name: 'Rowan Price',     score: 265, played_at: '2026-04-30' },
	{ name: 'Skyler Reed',     score: 258, played_at: '2026-04-30' },
	{ name: 'Peyton Gray',     score: 251, played_at: '2026-04-30' },
	{ name: 'Dakota James',    score: 244, played_at: '2026-04-30' },
	{ name: 'Emery Stone',     score: 238, played_at: '2026-04-30' },
	{ name: 'Harley Young',    score: 231, played_at: '2026-04-30' },
	{ name: 'River Hayes',     score: 224, played_at: '2026-04-30' },
	{ name: 'Charlie Webb',    score: 218, played_at: '2026-04-30' },
	{ name: 'Lennon Grant',    score: 211, played_at: '2026-04-30' },
	{ name: 'Parker Cole',     score: 204, played_at: '2026-04-30' },
	{ name: 'Remy Walsh',      score: 198, played_at: '2026-04-30' },
	{ name: 'Kendall Fox',     score: 191, played_at: '2026-04-30' },
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
