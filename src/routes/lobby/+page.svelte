<script lang="ts">
	import { mp } from '$lib/multiplayer.svelte';
	import { auth } from '$lib/auth.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!auth.isLoggedIn) {
			goto('/auth');
		}
	});

	let tab: 'create' | 'join' = $state('create');
	let playerName = $state(auth.user?.name ?? '');
	let joinCode = $state('');
	let loading = $state(false);
	let errorMsg = $state('');

	async function handleCreate() {
		const name = playerName.trim();
		if (!name) { errorMsg = 'Enter your name first.'; return; }
		loading = true;
		errorMsg = '';
		const result = await mp.createRoom(name);
		loading = false;
		if (result.error) { errorMsg = result.error; return; }
		goto(`/room/${result.roomCode}`);
	}

	async function handleJoin() {
		const name = playerName.trim();
		const code = joinCode.trim().toUpperCase();
		if (!name) { errorMsg = 'Enter your name first.'; return; }
		if (code.length < 4) { errorMsg = 'Enter the room code.'; return; }
		loading = true;
		errorMsg = '';
		const result = await mp.joinRoom(code, name);
		loading = false;
		if (result.error) { errorMsg = result.error; return; }
		goto(`/room/${result.roomCode}`);
	}
</script>

<svelte:head>
	<title>HealthyPick — Multiplayer Lobby</title>
</svelte:head>

<div class="min-h-[calc(100vh-68px)] bg-[#f9faf5] font-body">
	<div class="mx-auto max-w-md px-4 py-12">

		<!-- header -->
		<div class="mb-8 text-center">
			<p class="text-5xl">⚡</p>
			<h1 class="mt-3 font-heading text-4xl font-extrabold">Multiplayer</h1>
			<p class="mt-2 text-gray-500">Race friends to pick the healthiest dish — speed + accuracy wins!</p>
		</div>

		<!-- scoring explainer -->
		<div class="mb-8 rounded-xl border-[3px] border-black bg-white p-4">
			<p class="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-gray-500">How scoring works</p>
			<div class="flex flex-col gap-2">
				<div class="flex items-center gap-3">
					<span class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-teal/20 font-heading text-sm font-bold text-teal">100</span>
					<span class="text-sm text-gray-700">Health score — how good your picks are (per round)</span>
				</div>
				<div class="flex items-center gap-3">
					<span class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-purple/20 font-heading text-sm font-bold text-purple">+20</span>
					<span class="text-sm text-gray-700">Speed bonus — the faster you submit, the higher the bonus</span>
				</div>
				<div class="mt-1 rounded-lg bg-[#f9faf5] px-3 py-2 text-xs text-gray-500">
					Max score: 600 pts (500 health + 100 speed) over 5 rounds
				</div>
			</div>
		</div>

		<!-- tab switcher -->
		<div class="mb-6 flex rounded-xl border-[3px] border-black overflow-hidden">
			<button
				onclick={() => { tab = 'create'; errorMsg = ''; }}
				class="flex-1 py-3 font-heading font-bold transition-colors
					{tab === 'create' ? 'bg-purple text-white' : 'bg-white text-black hover:bg-gray-50'}"
			>
				Create Room
			</button>
			<button
				onclick={() => { tab = 'join'; errorMsg = ''; }}
				class="flex-1 border-l-[3px] border-black py-3 font-heading font-bold transition-colors
					{tab === 'join' ? 'bg-teal text-white' : 'bg-white text-black hover:bg-gray-50'}"
			>
				Join Room
			</button>
		</div>

		<!-- form -->
		<div class="rounded-xl border-[3px] border-black bg-white p-6 shadow-[4px_4px_0_0_#000]">
			<div class="flex flex-col gap-4">

				<!-- player name -->
				<div>
					<label for="playerName" class="mb-1.5 block font-heading text-sm font-bold">Your Name</label>
					<input
						id="playerName"
						type="text"
						bind:value={playerName}
						placeholder="e.g. Alice"
						maxlength="30"
						class="w-full rounded-lg border-[3px] border-black px-4 py-2.5 font-heading font-semibold focus:outline-none focus:ring-2 focus:ring-purple"
					/>
				</div>

				<!-- room code (join only) -->
				{#if tab === 'join'}
					<div>
						<label for="joinCode" class="mb-1.5 block font-heading text-sm font-bold">Room Code</label>
						<input
							id="joinCode"
							type="text"
							bind:value={joinCode}
							placeholder="e.g. ABC123"
							maxlength="6"
							class="w-full rounded-lg border-[3px] border-black px-4 py-2.5 font-heading text-lg font-extrabold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-teal"
							oninput={(e) => {
								const t = e.currentTarget as HTMLInputElement;
								joinCode = t.value.toUpperCase();
							}}
						/>
					</div>
				{/if}

				<!-- error -->
				{#if errorMsg}
					<p class="rounded-lg border-[2px] border-red-400 bg-red-50 px-4 py-2 font-heading text-sm font-semibold text-red-600">
						{errorMsg}
					</p>
				{/if}

				<!-- action button -->
				{#if tab === 'create'}
					<button
						onclick={handleCreate}
						disabled={loading}
						class="w-full rounded-xl border-[3px] border-black bg-purple px-6 py-3 font-heading font-bold text-white shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
					>
						{loading ? 'Creating…' : 'Create Room →'}
					</button>
				{:else}
					<button
						onclick={handleJoin}
						disabled={loading}
						class="w-full rounded-xl border-[3px] border-black bg-teal px-6 py-3 font-heading font-bold text-white shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
					>
						{loading ? 'Joining…' : 'Join Room →'}
					</button>
				{/if}

			</div>
		</div>

		<p class="mt-6 text-center text-xs text-gray-400">
			Rooms support up to 8 players. Share the 6-character code with friends.
		</p>

	</div>
</div>
