import { config } from 'dotenv';
config();
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
	process.env.PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
	{ auth: { autoRefreshToken: false, persistSession: false } }
);

const { count, error } = await sb
	.from('leaderboard')
	.delete({ count: 'exact' })
	.not('id', 'is', null);

if (error) {
	console.error('❌ Failed:', error.message);
	process.exit(1);
}
console.log(`✅ Deleted ${count} leaderboard rows.`);
