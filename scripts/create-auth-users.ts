/**
 * Creates Supabase Auth accounts for all test emails.
 * - Auto-confirms emails (no verification needed)
 * - Default password: HealthyPick123!
 * - Creates a profile row for each user
 * - Skips emails that already have an account
 *
 * Run with:  npm run db:create-users
 */

import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
	process.env.PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
	{ auth: { autoRefreshToken: false, persistSession: false } }
);

const DEFAULT_PASSWORD = 'HealthyPick123!';

const EMAILS = [
	'aungkyaw.win@gmail.com',
	'htet.aung@outlook.com',
	'zin.mar.oo@yahoo.com',
	'nay.linn.tun@gmail.com',
	'phyo.thiha@protonmail.com',
	'myo.ko.ko@gmail.com',
	'ye.htut.aung@yahoo.com',
	'thin.zar.oo@gmail.com',
	'thu.ya.naing@outlook.com',
	'kyaw.zin.htet@gmail.com',
	'su.sandar.oo@yahoo.com',
	'aung.chan.thar@gmail.com',
	'khin.moe.htwe@gmail.com',
	'wai.yan.phyo@yahoo.com',
	'moe.thu.zar@gmail.com',
	'htun.aung.kyaw@gmail.com',
	'shwe.sin.oo@outlook.com',
	'lin.htet.naing@gmail.com',
	'thu.ra.aung@yahoo.com',
	'phyu.sin.htwe@gmail.com',
	'naing.ko.ko@gmail.com',
	'zin.htut.aung@yahoo.com',
	'su.mon.htet@gmail.com',
	'myint.mo.thu@gmail.com',
	'htet.phyo.aung@yahoo.com',
	'aye.thiri.tun@gmail.com',
	'kyaw.min.htet@gmail.com',
	'thandar.win@yahoo.com',
	'lin.aung.phyo@gmail.com',
	'sandar.htwe@gmail.com',
	'htun.naing.oo@yahoo.com',
	'myo.thiha.aung@gmail.com',
	'wai.phyo.htet@gmail.com',
	'zin.moe.htwe@yahoo.com',
	'thu.zar.naing@gmail.com',
	'kyaw.zin.oo@gmail.com',
	'aung.thu.ya@yahoo.com',
	'moe.sandar.htwe@gmail.com',
	'lin.htut.aung@gmail.com',
	'su.phyo.naing@yahoo.com',
	'naing.htet.aung@gmail.com',
	'thiri.zar.oo@gmail.com',
	'phyo.aung.kyaw@yahoo.com',
	'myint.su.htwe@gmail.com',
	'wai.linn.htet@gmail.com',
	'htun.htet.naing@yahoo.com',
	'zin.thu.aung@gmail.com',
	'kyaw.thiha.htet@gmail.com',
	'sandar.aung.oo@yahoo.com',
	'lin.phyo.htwe@gmail.com',
	'thu.ra.htet@gmail.com',
	'phyu.moe.naing@yahoo.com',
	'aung.zin.htut@gmail.com',
	'htet.su.htwe@gmail.com',
	'myo.thu.ya@yahoo.com',
	'wai.aung.kyaw@gmail.com',
	'zin.htet.naing@gmail.com',
	'kyaw.mo.thu@yahoo.com',
	'su.zar.htwe@gmail.com',
	'naing.aung.htet@gmail.com',
	'thiri.phyo.htwe@yahoo.com',
	'lin.thu.aung@gmail.com',
	'phyo.htet.oo@gmail.com',
	'moe.thu.ra@yahoo.com',
	'htun.zin.htet@gmail.com',
	'sandar.naing.oo@gmail.com',
	'kyaw.thu.ya@yahoo.com',
	'zin.aung.htet@gmail.com',
	'myint.htet.naing@gmail.com',
	'wai.su.htwe@yahoo.com',
	'lin.aung.oo@gmail.com',
	'thu.phyo.naing@gmail.com',
	'phyu.htet.aung@yahoo.com',
	'kyaw.zin.naing@gmail.com',
	'moe.thiri.htwe@gmail.com',
	'htet.aung.oo@yahoo.com',
	'su.naing.htet@gmail.com',
	'myo.zin.htut@gmail.com',
	'lin.htet.oo@yahoo.com',
	'wai.aung.htet@gmail.com',
	'phyo.sandar.htwe@gmail.com',
	'kyaw.thu.ra@yahoo.com',
	'zin.htet.oo@gmail.com',
	'thiri.aung.htet@gmail.com',
	'moe.phyo.naing@yahoo.com',
	'htun.htet.aung@gmail.com',
	'su.thiri.htwe@gmail.com',
	'lin.naing.oo@yahoo.com',
	'kyaw.phyo.htet@gmail.com',
	'zin.aung.oo@gmail.com',
	'wai.htet.naing@yahoo.com',
	'phyu.zin.htwe@gmail.com',
	'myint.aung.htet@gmail.com',
	'sandar.htet.oo@yahoo.com',
	'lin.thiha.aung@gmail.com',
	'kyaw.zin.htet@yahoo.com',
	'thu.ra.naing@gmail.com',
	'phyo.htun.aung@gmail.com',
	'moe.htet.oo@yahoo.com',
	'su.phyo.htet@gmail.com',
	'lin.zin.htwe@gmail.com',
	'kyaw.aung.htet@yahoo.com',
	'zin.thiri.oo@gmail.com',
	'wai.htet.aung@gmail.com',
	'phyu.naing.htwe@yahoo.com',
	'myo.htet.oo@gmail.com',
	'sandar.aung.htet@gmail.com',
	'lin.phyo.oo@yahoo.com',
	'kyaw.htet.naing@gmail.com',
	'zin.aung.htwe@gmail.com',
	'wai.thu.ra@yahoo.com',
	'phyo.htet.naing@gmail.com',
	'moe.zin.htwe@gmail.com',
	'su.aung.htet@yahoo.com',
	'lin.htet.phyo@gmail.com',
	'kyaw.thiri.oo@gmail.com',
	'zin.htet.phyo@yahoo.com',
	'wai.naing.htet@gmail.com',
	'phyu.htet.oo@gmail.com',
	'myint.phyo.htwe@yahoo.com',
	'sandar.zin.htet@gmail.com',
	'lin.aung.htwe@gmail.com',
	'kyaw.phyo.oo@yahoo.com',
	'zin.htet.aung@gmail.com',
	'wai.htet.phyo@gmail.com',
	'phyo.naing.htwe@yahoo.com',
	'moe.htet.aung@gmail.com',
	'su.htet.naing@gmail.com',
	'lin.phyo.htet@yahoo.com',
	'kyaw.htet.aung@gmail.com',
	'zin.phyo.htwe@gmail.com',
	'wai.aung.oo@yahoo.com',
	'phyu.htet.phyo@gmail.com',
	'myo.naing.htet@gmail.com',
	'sandar.htet.phyo@yahoo.com',
	'lin.htet.naing@gmail.com',
	'kyaw.aung.htwe@gmail.com',
	'zin.htet.oo@yahoo.com',
	'wai.phyo.naing@gmail.com',
	'phyo.htet.htwe@gmail.com',
	'moe.naing.htet@yahoo.com',
	'su.htet.phyo@gmail.com',
	'lin.aung.htet@gmail.com',
	'kyaw.htet.oo@yahoo.com',
	'zin.naing.htet@gmail.com',
	'wai.htet.htwe@gmail.com',
];

function nameFromEmail(email: string): string {
	const local = email.split('@')[0];
	return local
		.split('.')
		.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
		.join(' ');
}

async function main() {
	console.log(`👤  Creating ${EMAILS.length} auth accounts…`);
	console.log(`🔑  Default password: ${DEFAULT_PASSWORD}\n`);

	let created = 0;
	let skipped = 0;
	let failed = 0;

	for (const email of EMAILS) {
		const name = nameFromEmail(email);

		const { data, error } = await supabase.auth.admin.createUser({
			email,
			password: DEFAULT_PASSWORD,
			email_confirm: true,          // skip email verification
			user_metadata: { name },
		});

		if (error) {
			if (error.message.toLowerCase().includes('already been registered') ||
			    error.message.toLowerCase().includes('already exists') ||
			    error.message.toLowerCase().includes('duplicate')) {
				console.log(`  ⚠️  skipped (already exists): ${email}`);
				skipped++;
			} else {
				console.error(`  ❌  failed: ${email} — ${error.message}`);
				failed++;
			}
			continue;
		}

		// Create profile row
		if (data.user) {
			await supabase
				.from('profiles')
				.upsert({ id: data.user.id, name }, { onConflict: 'id' });
		}

		console.log(`  ✅  ${email} → ${name}`);
		created++;
	}

	console.log(`\n📊  Done!`);
	console.log(`   Created : ${created}`);
	console.log(`   Skipped : ${skipped} (already existed)`);
	console.log(`   Failed  : ${failed}`);
	console.log(`\n🔑  All accounts use password: ${DEFAULT_PASSWORD}`);
}

main();
