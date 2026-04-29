/**
 * Drops all app tables and recreates them from scratch, then re-seeds.
 * WARNING: This deletes ALL data — rooms, players, scores, leaderboard entries.
 *   npm run db:reset
 */

import { config } from 'dotenv';
config();

import pg from 'pg';
const { Pool } = pg;

const DROP_SQL = `
DROP TABLE IF EXISTS room_submissions CASCADE;
DROP TABLE IF EXISTS room_players     CASCADE;
DROP TABLE IF EXISTS rooms            CASCADE;
DROP TABLE IF EXISTS leaderboard      CASCADE;
DROP TABLE IF EXISTS profiles         CASCADE;
`;

async function main() {
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	const client = await pool.connect();

	try {
		console.log('🗑️   Dropping all tables…');
		await client.query(DROP_SQL);
		console.log('✅  Tables dropped.');
	} catch (err) {
		console.error('❌  Drop failed:', err);
		process.exit(1);
	} finally {
		client.release();
		await pool.end();
	}

	// Re-run setup then seed by spawning child processes
	const { execSync } = await import('child_process');
	console.log('\n🔧  Re-running db:setup…');
	execSync('npm run db:setup', { stdio: 'inherit' });
	console.log('\n🌱  Re-running db:seed…');
	execSync('npm run db:seed', { stdio: 'inherit' });
	console.log('\n🎉  Database reset complete.');
}

main();
