import { browser } from '$app/environment';

const STORAGE_KEY = 'healthypick_leaderboard';
const MAX_ENTRIES = 20;

export interface LeaderboardEntry {
	name: string;
	score: number; // out of 500
	date: string;
}

const seedEntries: LeaderboardEntry[] = [
	{ name: 'Alex Chen', score: 487, date: '2026-04-20' },
	{ name: 'Sam Rivera', score: 463, date: '2026-04-21' },
	{ name: 'Jordan Kim', score: 445, date: '2026-04-19' },
	{ name: 'Taylor Pham', score: 428, date: '2026-04-22' },
	{ name: 'Morgan Liu', score: 412, date: '2026-04-18' },
	{ name: 'Casey Walsh', score: 389, date: '2026-04-17' },
	{ name: 'Jamie Park', score: 361, date: '2026-04-15' },
	{ name: 'Riley Scott', score: 340, date: '2026-04-14' }
];

class LeaderboardStore {
	entries: LeaderboardEntry[] = $state([]);

	constructor() {
		if (browser) {
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (raw) {
					this.entries = JSON.parse(raw);
				} else {
					this.entries = [...seedEntries];
					this._save();
				}
			} catch {
				this.entries = [...seedEntries];
				this._save();
			}
		}
	}

	private _save(): void {
		if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
	}

	addEntry(name: string, score: number): void {
		this.entries = [...this.entries, { name, score, date: new Date().toISOString().split('T')[0] }]
			.sort((a, b) => b.score - a.score)
			.slice(0, MAX_ENTRIES);
		this._save();
	}

	getRank(score: number): number {
		return this.entries.filter((e) => e.score > score).length + 1;
	}

	get top10(): LeaderboardEntry[] {
		return this.entries.slice(0, 10);
	}
}

export const leaderboard = new LeaderboardStore();
