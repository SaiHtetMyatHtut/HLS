import { browser } from '$app/environment';
import { supabase } from '$lib/supabase';

export interface LeaderboardEntry {
	name: string;
	score: number;
	date: string;
}

class LeaderboardStore {
	entries: LeaderboardEntry[] = $state([]);
	loading = $state(false);
	loadError = $state<string | null>(null);

	constructor() {
		if (browser) this.load();
	}

	async load(): Promise<void> {
		this.loading = true;
		this.loadError = null;

		const { data, error } = await supabase
			.from('leaderboard')
			.select('name, score, played_at')
			.order('score', { ascending: false })
			.limit(20);

		if (error) {
			console.error('[leaderboard] load failed:', error.message);
			this.loadError = error.message;
		} else if (data) {
			this.entries = data.map((row) => ({
				name: row.name as string,
				score: row.score as number,
				date: ((row.played_at as string) ?? '').split('T')[0]
			}));
		}

		this.loading = false;
	}

	async addEntry(name: string, score: number): Promise<{ error?: string }> {
		const {
			data: { session }
		} = await supabase.auth.getSession();

		const { error } = await supabase.from('leaderboard').insert({
			name,
			score,
			user_id: session?.user?.id ?? null,
			played_at: new Date().toISOString().split('T')[0]
		});

		if (error) {
			console.error('[leaderboard] save failed:', error.message, error.code);
			return { error: `Score could not be saved: ${error.message}` };
		}

		await this.load();
		return {};
	}

	getRank(score: number): number {
		return this.entries.filter((e) => e.score > score).length + 1;
	}

	get top10(): LeaderboardEntry[] {
		return this.entries.slice(0, 10);
	}
}

export const leaderboard = new LeaderboardStore();
