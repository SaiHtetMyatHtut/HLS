import { browser } from '$app/environment';

const STORAGE_KEY = 'healthypick_user';

class AuthStore {
	user = $state<{ name: string; email: string } | null>(null);

	constructor() {
		if (browser) {
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (raw) this.user = JSON.parse(raw);
			} catch {
				// ignore malformed data
			}
		}
	}

	get isLoggedIn() {
		return this.user !== null;
	}

	login(email: string, _password: string): void {
		const name = email.split('@')[0].replace(/[._]/g, ' ');
		this.user = { name, email };
		if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user));
	}

	register(name: string, email: string, _password: string): void {
		this.user = { name, email };
		if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user));
	}

	logout(): void {
		this.user = null;
		if (browser) localStorage.removeItem(STORAGE_KEY);
	}
}

export const auth = new AuthStore();
