<script lang="ts">
	import { auth } from '$lib/auth.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// redirect if already logged in
	onMount(() => {
		if (auth.isLoggedIn) goto('/game');
	});

	let tab = $state<'login' | 'register'>('login');

	// login fields
	let loginEmail = $state('');
	let loginPassword = $state('');
	let loginError = $state('');
	let loginLoading = $state(false);

	// register fields
	let regName = $state('');
	let regEmail = $state('');
	let regPassword = $state('');
	let regConfirm = $state('');
	let regError = $state('');
	let regLoading = $state(false);

	function switchTab(t: 'login' | 'register') {
		tab = t;
		loginError = '';
		regError = '';
	}

	async function handleLogin() {
		loginError = '';
		if (!loginEmail || !loginPassword) {
			loginError = 'Please fill in all fields.';
			return;
		}
		loginLoading = true;
		// mock async delay
		await new Promise((r) => setTimeout(r, 600));
		auth.login(loginEmail, loginPassword);
		loginLoading = false;
		goto('/game');
	}

	async function handleRegister() {
		regError = '';
		if (!regName || !regEmail || !regPassword || !regConfirm) {
			regError = 'Please fill in all fields.';
			return;
		}
		if (regPassword !== regConfirm) {
			regError = 'Passwords do not match.';
			return;
		}
		if (regPassword.length < 6) {
			regError = 'Password must be at least 6 characters.';
			return;
		}
		regLoading = true;
		await new Promise((r) => setTimeout(r, 600));
		auth.register(regName, regEmail, regPassword);
		regLoading = false;
		goto('/game');
	}
</script>

<svelte:head>
	<title>HealthyPick — {tab === 'login' ? 'Login' : 'Create Account'}</title>
</svelte:head>

<div class="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[#f9faf5] px-4 py-12 font-body">
	<!-- decorative shapes -->
	<div class="pointer-events-none fixed -left-16 top-24 h-40 w-40 -rotate-12 rounded-2xl border-[4px] border-black bg-teal opacity-20"></div>
	<div class="pointer-events-none fixed -right-12 bottom-24 h-48 w-48 rotate-12 rounded-2xl border-[4px] border-black bg-purple opacity-20"></div>

	<div class="relative w-full max-w-md">
		<!-- offset card shadow -->
		<div class="absolute -bottom-3 -right-3 h-full w-full rounded-2xl border-[5px] border-black bg-teal"></div>

		<div class="relative rounded-2xl border-[5px] border-black bg-white p-8 sm:p-10">
			<!-- logo -->
			<div class="mb-6 text-center">
				<span class="text-4xl">🥦</span>
				<h1 class="mt-2 font-heading text-2xl font-extrabold text-black">HealthyPick</h1>
				<p class="mt-1 text-sm text-gray-500">
					{tab === 'login' ? 'Welcome back! Log in to continue.' : 'Create an account to start playing.'}
				</p>
			</div>

			<!-- tabs -->
			<div class="mb-6 flex overflow-hidden rounded-lg border-[3px] border-black">
				<button
					onclick={() => switchTab('login')}
					class="flex-1 py-2 font-heading font-bold transition-colors {tab === 'login' ? 'bg-purple text-white' : 'bg-white text-black hover:bg-gray-50'}"
				>
					Login
				</button>
				<button
					onclick={() => switchTab('register')}
					class="flex-1 border-l-[3px] border-black py-2 font-heading font-bold transition-colors {tab === 'register' ? 'bg-purple text-white' : 'bg-white text-black hover:bg-gray-50'}"
				>
					Register
				</button>
			</div>

			<!-- login form -->
			{#if tab === 'login'}
				<form onsubmit={(e) => { e.preventDefault(); handleLogin(); }} class="flex flex-col gap-4">
					<div>
						<label class="mb-1 block font-heading text-sm font-bold text-black" for="login-email">
							Email
						</label>
						<input
							id="login-email"
							type="email"
							autocomplete="email"
							bind:value={loginEmail}
							placeholder="you@example.com"
							class="w-full rounded-lg border-[3px] border-black px-4 py-2.5 font-body text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_3px] focus:shadow-purple/40"
						/>
					</div>
					<div>
						<label class="mb-1 block font-heading text-sm font-bold text-black" for="login-password">
							Password
						</label>
						<input
							id="login-password"
							type="password"
							autocomplete="current-password"
							bind:value={loginPassword}
							placeholder="••••••••"
							class="w-full rounded-lg border-[3px] border-black px-4 py-2.5 font-body text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_3px] focus:shadow-purple/40"
						/>
					</div>
					{#if loginError}
						<p class="rounded-lg border-[2px] border-red-300 bg-red-50 px-4 py-2 text-sm text-red-600">{loginError}</p>
					{/if}
					<button
						type="submit"
						disabled={loginLoading}
						class="mt-2 rounded-xl border-[4px] border-black bg-purple py-3 font-heading font-bold text-white shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-60"
					>
						{loginLoading ? 'Logging in…' : 'Login →'}
					</button>
					<p class="text-center text-sm text-gray-500">
						No account?
						<button onclick={() => switchTab('register')} class="font-bold text-purple underline underline-offset-2">
							Register here
						</button>
					</p>
				</form>

			<!-- register form -->
			{:else}
				<form onsubmit={(e) => { e.preventDefault(); handleRegister(); }} class="flex flex-col gap-4">
					<div>
						<label class="mb-1 block font-heading text-sm font-bold text-black" for="reg-name">
							Full Name
						</label>
						<input
							id="reg-name"
							type="text"
							autocomplete="name"
							bind:value={regName}
							placeholder="Alex Johnson"
							class="w-full rounded-lg border-[3px] border-black px-4 py-2.5 font-body text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_3px] focus:shadow-purple/40"
						/>
					</div>
					<div>
						<label class="mb-1 block font-heading text-sm font-bold text-black" for="reg-email">
							Email
						</label>
						<input
							id="reg-email"
							type="email"
							autocomplete="email"
							bind:value={regEmail}
							placeholder="you@example.com"
							class="w-full rounded-lg border-[3px] border-black px-4 py-2.5 font-body text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_3px] focus:shadow-purple/40"
						/>
					</div>
					<div>
						<label class="mb-1 block font-heading text-sm font-bold text-black" for="reg-password">
							Password
						</label>
						<input
							id="reg-password"
							type="password"
							autocomplete="new-password"
							bind:value={regPassword}
							placeholder="Min. 6 characters"
							class="w-full rounded-lg border-[3px] border-black px-4 py-2.5 font-body text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_3px] focus:shadow-purple/40"
						/>
					</div>
					<div>
						<label class="mb-1 block font-heading text-sm font-bold text-black" for="reg-confirm">
							Confirm Password
						</label>
						<input
							id="reg-confirm"
							type="password"
							autocomplete="new-password"
							bind:value={regConfirm}
							placeholder="Repeat password"
							class="w-full rounded-lg border-[3px] border-black px-4 py-2.5 font-body text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_3px] focus:shadow-purple/40"
						/>
					</div>
					{#if regError}
						<p class="rounded-lg border-[2px] border-red-300 bg-red-50 px-4 py-2 text-sm text-red-600">{regError}</p>
					{/if}
					<button
						type="submit"
						disabled={regLoading}
						class="mt-2 rounded-xl border-[4px] border-black bg-teal py-3 font-heading font-bold text-white shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-60"
					>
						{regLoading ? 'Creating account…' : 'Create Account & Play →'}
					</button>
					<p class="text-center text-sm text-gray-500">
						Already have an account?
						<button onclick={() => switchTab('login')} class="font-bold text-purple underline underline-offset-2">
							Login
						</button>
					</p>
				</form>
			{/if}
		</div>
	</div>
</div>
