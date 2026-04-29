/**
 * Creates all tables, RLS policies, and Realtime config in Supabase.
 * Run once after creating a new Supabase project:
 *   npm run db:setup
 */

import { config } from 'dotenv';
config();

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const SQL = `
-- ─── Profiles (linked to Supabase Auth) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id   UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_select_all') THEN
    CREATE POLICY profiles_select_all ON profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_insert_own') THEN
    CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_update_own') THEN
    CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- ─── Leaderboard ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leaderboard (
  id        UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id   UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  name      TEXT        NOT NULL,
  score     INTEGER     NOT NULL CHECK (score >= 0 AND score <= 500),
  played_at DATE        DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leaderboard_score_idx ON leaderboard (score DESC);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='leaderboard' AND policyname='leaderboard_select_all') THEN
    CREATE POLICY leaderboard_select_all ON leaderboard FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='leaderboard' AND policyname='leaderboard_insert_anon') THEN
    -- Allow both authenticated and anonymous inserts (multiplayer uses anon)
    CREATE POLICY leaderboard_insert_anon ON leaderboard FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ─── Rooms ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  code                 TEXT PRIMARY KEY,
  host_player_id       TEXT NOT NULL,
  phase                TEXT NOT NULL DEFAULT 'lobby'
                         CHECK (phase IN ('lobby','playing','round_end','finished')),
  current_round        INTEGER NOT NULL DEFAULT 0,
  total_rounds         INTEGER NOT NULL DEFAULT 5,
  serialized_challenges JSONB NOT NULL DEFAULT '[]',
  round_start_time     BIGINT,
  round_duration       INTEGER NOT NULL DEFAULT 60,
  round_results        JSONB,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  expires_at           TIMESTAMPTZ DEFAULT NOW() + INTERVAL '2 hours'
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rooms' AND policyname='rooms_select_all') THEN
    CREATE POLICY rooms_select_all ON rooms FOR SELECT USING (true);
  END IF;
END $$;

-- Enable Realtime on rooms
ALTER TABLE rooms REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
  END IF;
END $$;

-- ─── Room Players ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS room_players (
  id                   TEXT PRIMARY KEY,
  room_code            TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  scores               INTEGER[] DEFAULT '{}',
  speed_bonuses        INTEGER[] DEFAULT '{}',
  submitted_this_round BOOLEAN   DEFAULT FALSE,
  joined_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS room_players_room_code_idx ON room_players (room_code);

ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='room_players' AND policyname='room_players_select_all') THEN
    CREATE POLICY room_players_select_all ON room_players FOR SELECT USING (true);
  END IF;
END $$;

-- Enable Realtime on room_players
ALTER TABLE room_players REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'room_players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE room_players;
  END IF;
END $$;

-- ─── Room Submissions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS room_submissions (
  room_code    TEXT    NOT NULL,
  player_id    TEXT    NOT NULL,
  round_index  INTEGER NOT NULL,
  picks        TEXT[]  NOT NULL,
  submitted_at BIGINT  NOT NULL,
  PRIMARY KEY (room_code, player_id, round_index)
);

ALTER TABLE room_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='room_submissions' AND policyname='room_submissions_select_all') THEN
    CREATE POLICY room_submissions_select_all ON room_submissions FOR SELECT USING (true);
  END IF;
END $$;
`;

async function main() {
	console.log('🔧  Setting up database schema…');
	const client = await pool.connect();
	try {
		await client.query(SQL);
		console.log('✅  Schema created successfully.');
	} catch (err) {
		console.error('❌  Schema setup failed:', err);
		process.exit(1);
	} finally {
		client.release();
		await pool.end();
	}
}

main();
