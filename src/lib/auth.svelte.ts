import { browser } from '$app/environment';
import { supabase } from '$lib/supabase';
import type { User } from '@supabase/supabase-js';

class AuthStore {
	private _supaUser = $state<User | null>(null);
	loading = $state(true);

	constructor() {
		if (!browser) return;

		supabase.auth.getSession().then(({ data: { session } }) => {
			this._supaUser = session?.user ?? null;
			this.loading = false;
			if (session?.user) this.ensureProfile(session.user);
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			this._supaUser = session?.user ?? null;
			this.loading = false;
			if (session?.user) this.ensureProfile(session.user);
		});
	}

	// Re-creates the profile row if it was deleted (keeps auth working after DB resets)
	private async ensureProfile(user: User): Promise<void> {
		const name =
			(user.user_metadata?.name as string) ??
			user.email?.split('@')[0] ??
			'Player';
		await supabase
			.from('profiles')
			.upsert({ id: user.id, name }, { onConflict: 'id' });
	}

	get isLoggedIn() {
		return this._supaUser !== null;
	}

	get user() {
		if (!this._supaUser) return null;
		return {
			id: this._supaUser.id,
			email: this._supaUser.email ?? '',
			name:
				(this._supaUser.user_metadata?.name as string) ??
				this._supaUser.email?.split('@')[0] ??
				'Player'
		};
	}

	async login(email: string, password: string): Promise<{ error?: string }> {
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) return { error: error.message };
		return {};
	}

	async register(
		name: string,
		email: string,
		password: string
	): Promise<{ error?: string }> {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { name } }
		});
		if (error) return { error: error.message };
		if (data.user) {
			await supabase.from('profiles').upsert({ id: data.user.id, name }, { onConflict: 'id' });
		}
		return {};
	}

	async logout(): Promise<void> {
		await supabase.auth.signOut();
	}
}

export const auth = new AuthStore();
