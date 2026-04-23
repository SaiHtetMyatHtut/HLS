<script lang="ts">
	import { mp } from '$lib/multiplayer.svelte';
	import { auth } from '$lib/auth.svelte';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { categoryMeta } from '$lib/game-data';
	import type { Category } from '$lib/game-data';

	const roomCode = page.params.code;

	onMount(() => {
		if (!auth.isLoggedIn) { goto('/auth'); return; }

		// If we already have a live connection to this room, do nothing.
		if (mp.roomCode === roomCode && mp.connected) return;

		// Try restoring session (e.g. page refresh)
		const restored = mp.restoreFromSession();
		if (!restored || mp.roomCode !== roomCode) {
			goto('/lobby');
		}
	});

	onDestroy(() => {
		// Keep the SSE alive; user might navigate back.
		// Full cleanup happens on clearSession() (back-to-lobby).
	});

	// ── picking state ───────────────────────────────────────────────────────
	let selectedIds: string[] = $state([]);

	// Reset picks when round changes
	$effect(() => {
		if (mp.room?.currentRound !== undefined) {
			selectedIds = [];
		}
	});

	function toggleIngredient(id: string) {
		if (mp.submittedThisRound || mp.room?.phase !== 'playing') return;
		const challenge = mp.room?.challenge;
		if (!challenge) return;
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((x) => x !== id);
		} else if (selectedIds.length < challenge.pickCount) {
			selectedIds = [...selectedIds, id];
		}
	}

	let submitting = $state(false);
	async function submitDish() {
		const challenge = mp.room?.challenge;
		if (!challenge || selectedIds.length < challenge.pickCount) return;
		submitting = true;
		await mp.submitPicks(selectedIds);
		submitting = false;
	}

	let starting = $state(false);
	async function startGame() {
		starting = true;
		const result = await mp.startGame();
		starting = false;
		if (result.error) alert(result.error);
	}

	function leaveRoom() {
		mp.clearSession();
		goto('/lobby');
	}

	// ── timer display ───────────────────────────────────────────────────────
	let timerColor = $derived(
		mp.timeRemaining > 30
			? 'text-teal'
			: mp.timeRemaining > 10
				? 'text-yellow-600'
				: 'text-[#f87171]'
	);
	let timerBg = $derived(
		mp.timeRemaining > 30
			? 'bg-teal'
			: mp.timeRemaining > 10
				? 'bg-yellow'
				: 'bg-[#f87171]'
	);
	let timerPulse = $derived(mp.timeRemaining <= 10 && mp.room?.phase === 'playing');

	// ── score helpers ───────────────────────────────────────────────────────
	function medalEmoji(index: number): string {
		return index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
	}

	function scoreBarColor(score: number): string {
		if (score >= 80) return 'bg-teal';
		if (score >= 50) return 'bg-yellow';
		return 'bg-[#f87171]';
	}

	function healthLabel(score: number): string {
		if (score >= 8) return 'Excellent';
		if (score >= 5) return 'Decent';
		return 'Poor';
	}

	function healthColor(score: number): string {
		if (score >= 8) return 'text-teal border-teal bg-teal/10';
		if (score >= 5) return 'text-yellow-600 border-yellow-400 bg-yellow/20';
		return 'text-[#f87171] border-[#f87171] bg-red-50';
	}

	let copiedCode = $state(false);
	function copyCode() {
		if (!mp.roomCode) return;
		navigator.clipboard.writeText(mp.roomCode).then(() => {
			copiedCode = true;
			setTimeout(() => (copiedCode = false), 2000);
		});
	}

	// sort players by total score descending
	let sortedPlayers = $derived(
		[...(mp.room?.players ?? [])].sort((a, b) => b.totalScore - a.totalScore)
	);
</script>

<svelte:head>
	<title>HealthyPick — Room {roomCode}</title>
</svelte:head>

<div class="min-h-[calc(100vh-68px)] bg-[#f9faf5] font-body">

	<!-- ═══════════ CONNECTING / ERROR ═══════════ -->
	{#if !mp.room}
		<div class="flex min-h-[calc(100vh-68px)] items-center justify-center">
			{#if mp.error}
				<div class="text-center">
					<p class="text-5xl mb-4">😕</p>
					<p class="font-heading text-xl font-bold text-gray-700">{mp.error}</p>
					<a href="/lobby" class="mt-4 inline-block font-heading font-semibold text-teal underline underline-offset-4">
						← Back to lobby
					</a>
				</div>
			{:else}
				<div class="text-center">
					<div class="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-teal border-t-transparent mx-auto"></div>
					<p class="font-heading font-semibold text-gray-500">Connecting to room {roomCode}…</p>
				</div>
			{/if}
		</div>

	<!-- ═══════════ LOBBY ═══════════ -->
	{:else if mp.room.phase === 'lobby'}
		<div class="mx-auto max-w-lg px-4 py-10">

			<!-- room code -->
			<div class="relative mb-6">
				<div class="absolute -bottom-2 -right-2 h-full w-full rounded-2xl border-[4px] border-black bg-purple opacity-40"></div>
				<div class="relative rounded-2xl border-[4px] border-black bg-white p-6 text-center">
					<p class="font-heading text-sm font-bold uppercase tracking-widest text-gray-400">Room Code</p>
					<p class="mt-2 font-heading text-5xl font-extrabold tracking-[0.2em] text-black">{mp.roomCode}</p>
					<button
						onclick={copyCode}
						class="mt-4 rounded-lg border-[2px] border-black px-4 py-1.5 font-heading text-sm font-bold transition-all hover:bg-gray-50"
					>
						{copiedCode ? '✓ Copied!' : 'Copy Code'}
					</button>
					<p class="mt-3 text-xs text-gray-400">Share this code with friends to join your room</p>
				</div>
			</div>

			<!-- player list -->
			<h2 class="mb-3 font-heading text-xl font-extrabold">
				Players ({mp.room.players.length}/8)
			</h2>
			<div class="mb-8 overflow-hidden rounded-xl border-[3px] border-black bg-white">
				{#each mp.room.players as player, i}
					<div class="flex items-center gap-3 border-b-[2px] border-black px-5 py-3 last:border-b-0
						{player.id === mp.playerId ? 'bg-teal/10' : i % 2 === 0 ? 'bg-white' : 'bg-[#f9faf5]'}">
						<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-[2px] border-black
							{player.id === mp.room?.hostId ? 'bg-purple text-white' : 'bg-gray-100 text-gray-600'}
							font-heading text-sm font-extrabold uppercase">
							{player.name[0]}
						</div>
						<span class="flex-1 font-heading font-semibold capitalize">
							{player.name}{player.id === mp.playerId ? ' (you)' : ''}
						</span>
						{#if player.id === mp.room?.hostId}
							<span class="rounded-full border-[2px] border-black bg-purple/15 px-2.5 py-0.5 font-heading text-xs font-bold text-purple">
								Host
							</span>
						{/if}
					</div>
				{/each}
			</div>

			<!-- actions -->
			{#if mp.isHost}
				<button
					onclick={startGame}
					disabled={starting || mp.room.players.length < 1}
					class="w-full rounded-xl border-[3px] border-black bg-teal px-6 py-3.5 font-heading font-bold text-white shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
				>
					{starting ? 'Starting…' : 'Start Game →'}
				</button>
				<p class="mt-2 text-center text-xs text-gray-400">You are the host — start when everyone has joined</p>
			{:else}
				<div class="rounded-xl border-[3px] border-black bg-white px-6 py-4 text-center">
					<div class="mb-2 h-5 w-5 animate-spin rounded-full border-3 border-purple border-t-transparent inline-block"></div>
					<p class="font-heading font-semibold text-gray-600">Waiting for the host to start the game…</p>
				</div>
			{/if}

			<button onclick={leaveRoom} class="mt-4 w-full font-heading text-sm font-semibold text-gray-400 underline underline-offset-2 hover:text-black">
				Leave Room
			</button>
		</div>

	<!-- ═══════════ PLAYING ═══════════ -->
	{:else if mp.room.phase === 'playing'}
		{@const challenge = mp.room.challenge}
		<div class="mx-auto flex min-h-[calc(100vh-68px)] max-w-5xl flex-col px-4 py-4">

			<!-- top bar: round + timer -->
			<div class="mb-3 flex items-center justify-between gap-4">
				<p class="font-heading text-lg font-bold">
					Round {mp.room.currentRound + 1}<span class="text-gray-400">/{mp.room.totalRounds}</span>
				</p>

				<!-- timer -->
				<div class="flex items-center gap-2">
					<span class="font-heading text-sm font-semibold text-gray-500">Time:</span>
					<span class="font-heading text-2xl font-extrabold {timerColor} {timerPulse ? 'animate-pulse' : ''}">
						{mp.timeRemaining}s
					</span>
				</div>

				<p class="font-heading text-sm font-semibold text-gray-500">
					Score: {mp.myPlayer?.totalScore ?? 0}
				</p>
			</div>

			<!-- timer bar -->
			<div class="mb-4 h-2.5 overflow-hidden rounded-full border-[3px] border-black bg-gray-200">
				<div
					class="h-full rounded-full transition-all duration-1000 {timerBg}"
					style="width: {(mp.timeRemaining / 60) * 100}%"
				></div>
			</div>

			{#if challenge}
				<!-- challenge header -->
				<div class="relative mb-4">
					<div class="absolute -bottom-1.5 -right-1.5 h-full w-full rounded-xl border-[3px] border-black bg-purple opacity-50"></div>
					<div class="relative rounded-xl border-[3px] border-black bg-white px-5 py-3">
						<div class="flex items-center gap-3">
							<span class="text-3xl">{challenge.emoji}</span>
							<div>
								<h2 class="font-heading text-lg font-extrabold leading-tight">{challenge.title}</h2>
								<p class="text-sm text-gray-500">{challenge.prompt}</p>
							</div>
						</div>
						<p class="mt-2 font-heading text-sm font-bold
							{selectedIds.length === challenge.pickCount ? 'text-teal' : 'text-gray-400'}">
							{selectedIds.length}/{challenge.pickCount} selected
							{#if selectedIds.length === challenge.pickCount}— ready to submit!{/if}
						</p>
					</div>
				</div>

				<!-- ingredient grid -->
				{#if !mp.submittedThisRound}
					<div class="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
						{#each challenge.ingredients as ing}
							{@const isSelected = selectedIds.includes(ing.id)}
							{@const isDisabled = !isSelected && selectedIds.length >= challenge.pickCount}
							<button
								onclick={() => toggleIngredient(ing.id)}
								disabled={isDisabled}
								class="relative flex flex-col items-center rounded-xl border-[3px] border-black p-3 text-center transition-all
									{isSelected
										? 'bg-teal/15 ring-4 ring-teal shadow-[3px_3px_0_0_#46c4b8]'
										: isDisabled
											? 'cursor-not-allowed bg-gray-50 opacity-40'
											: 'bg-white hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000]'}"
							>
								{#if isSelected}
									<span class="absolute right-2 top-2 font-bold text-teal text-sm">✓</span>
								{/if}
								<span class="text-3xl">{ing.emoji}</span>
								<p class="mt-1 font-heading text-xs font-bold leading-tight">{ing.name}</p>
								<span class="mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold {categoryMeta[ing.category as Category]?.color ?? 'bg-gray-200 text-gray-700'}">
									{categoryMeta[ing.category as Category]?.label ?? ing.category}
								</span>
								<p class="mt-1 text-[10px] text-gray-400">{ing.calories} cal</p>
							</button>
						{/each}
					</div>

					<div class="mt-4 flex justify-center">
						<button
							onclick={submitDish}
							disabled={selectedIds.length < challenge.pickCount || submitting}
							class="rounded-xl border-[4px] border-black bg-purple px-10 py-3 font-heading font-bold text-white shadow-[4px_4px_0_0_#000] transition-all
								hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000]
								disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
						>
							{submitting ? 'Submitting…' : 'Submit Dish →'}
						</button>
					</div>

				{:else}
					<!-- submitted overlay -->
					<div class="flex flex-1 flex-col items-center justify-center gap-6 py-10">
						<div class="rounded-2xl border-[4px] border-black bg-white px-10 py-8 text-center shadow-[6px_6px_0_0_#000]">
							<p class="text-5xl">✅</p>
							<p class="mt-3 font-heading text-xl font-extrabold text-teal">Dish submitted!</p>
							<p class="mt-1 text-gray-500">Waiting for other players…</p>
						</div>

						<!-- live submission status -->
						<div class="w-full max-w-xs rounded-xl border-[3px] border-black bg-white p-4">
							<p class="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-gray-400">Submitted</p>
							<div class="flex flex-col gap-2">
								{#each mp.room.players as p}
									<div class="flex items-center gap-2">
										<span class="text-sm {p.submittedThisRound ? 'text-teal' : 'text-gray-400'}">
											{p.submittedThisRound ? '✓' : '⏳'}
										</span>
										<span class="font-heading text-sm font-semibold {p.submittedThisRound ? 'text-teal' : 'text-gray-600'}">
											{p.name}{p.id === mp.playerId ? ' (you)' : ''}
										</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/if}
			{/if}
		</div>

	<!-- ═══════════ ROUND END ═══════════ -->
	{:else if mp.room.phase === 'round_end'}
		<div class="mx-auto max-w-3xl px-4 py-8">

			<!-- round header -->
			<div class="mb-6 text-center">
				<p class="font-heading text-sm font-bold uppercase tracking-widest text-gray-400">
					Round {mp.room.currentRound + 1} of {mp.room.totalRounds}
				</p>
				<h2 class="font-heading text-3xl font-extrabold">Round Results</h2>
				{#if mp.nextRoundIn !== null}
					<p class="mt-1 text-sm text-gray-400">
						{mp.room.currentRound + 1 < mp.room.totalRounds
							? `Next round in ${mp.nextRoundIn}s…`
							: `Final results in ${mp.nextRoundIn}s…`}
					</p>
				{/if}
			</div>

			<!-- round leaderboard -->
			{#if mp.roundResults}
				<div class="mb-6 overflow-hidden rounded-2xl border-[4px] border-black bg-white">
					<div class="border-b-[3px] border-black bg-[#f9faf5] px-5 py-2.5">
						<p class="font-heading text-sm font-bold uppercase tracking-wide text-gray-500">This Round</p>
					</div>
					{#each mp.roundResults as result, i}
						{@const isMe = result.playerId === mp.playerId}
						<div class="flex items-center gap-3 border-b-[2px] border-black px-5 py-3.5 last:border-b-0
							{isMe ? 'bg-teal/10' : i % 2 === 0 ? 'bg-white' : 'bg-[#f9faf5]'}">
							<span class="w-8 text-center font-heading text-xl font-extrabold">{medalEmoji(i)}</span>
							<div class="flex-1">
								<p class="font-heading font-bold capitalize {isMe ? 'text-teal' : 'text-black'}">
									{result.playerName}{isMe ? ' (you)' : ''}
								</p>
								<div class="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
									<span>Health: <strong class="text-gray-700">{result.healthScore}</strong></span>
									<span>+</span>
									<span>Speed: <strong class="text-purple">{result.speedBonus}</strong></span>
								</div>
							</div>
							<div class="text-right">
								<p class="font-heading text-2xl font-extrabold">{result.roundTotal}</p>
								<p class="text-xs text-gray-400">pts this round</p>
							</div>
						</div>
					{/each}
				</div>

				<!-- your picks revealed -->
				{#if mp.myRoundResult}
					<div class="mb-6">
						<p class="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-gray-500">Your Picks — Revealed</p>
						<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
							{#each mp.myRoundResult.picks as pick}
								<div class="flex flex-col items-center rounded-xl border-[3px] border-black bg-white p-3 text-center {healthColor(pick.healthScore).includes('teal') ? 'ring-2 ring-teal' : healthColor(pick.healthScore).includes('f87171') ? 'ring-2 ring-[#f87171]' : 'ring-2 ring-yellow-400'}">
									<span class="text-3xl">{pick.emoji}</span>
									<p class="mt-1 font-heading text-xs font-bold leading-tight">{pick.name}</p>
									<div class="mt-1.5 rounded-full border-2 px-2 py-0.5 text-xs font-bold {healthColor(pick.healthScore)}">
										{pick.healthScore}/10 — {healthLabel(pick.healthScore)}
									</div>
									<p class="mt-1 text-[10px] text-gray-500 leading-tight line-clamp-2">{pick.benefit}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- optimal picks -->
				{#if mp.optimalPicks && mp.optimalPicks.length > 0}
					{@const myPickIds = new Set(mp.myRoundResult?.picks.map((p) => p.id) ?? [])}
					{@const isPerfect = mp.optimalPicks.every((p) => myPickIds.has(p.id))}
					{#if !isPerfect}
						<div class="mb-6 rounded-xl border-[3px] border-black bg-white p-4">
							<p class="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-gray-500">🏆 Optimal Picks</p>
							<div class="flex flex-wrap gap-2">
								{#each mp.optimalPicks as pick}
									<div class="flex items-center gap-1.5 rounded-full border-[2px] border-black px-3 py-1.5 text-sm font-heading font-semibold
										{myPickIds.has(pick.id) ? 'bg-teal/20 text-teal' : 'bg-[#f9faf5] text-gray-600'}">
										<span>{pick.emoji}</span>
										<span>{pick.name}</span>
										<span class="font-bold">{pick.healthScore}/10</span>
										{#if myPickIds.has(pick.id)}<span>✓</span>{/if}
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<div class="mb-6 rounded-xl border-[3px] border-teal bg-teal/10 px-5 py-3 text-center">
							<p class="font-heading font-bold text-teal">🎯 Perfect round! You picked the optimal combination.</p>
						</div>
					{/if}
				{/if}

				<!-- overall standings -->
				<div class="overflow-hidden rounded-2xl border-[4px] border-black bg-white">
					<div class="border-b-[3px] border-black bg-[#f9faf5] px-5 py-2.5">
						<p class="font-heading text-sm font-bold uppercase tracking-wide text-gray-500">Overall Standings</p>
					</div>
					{#each sortedPlayers as player, i}
						{@const isMe = player.id === mp.playerId}
						<div class="flex items-center gap-3 border-b-[2px] border-black px-5 py-3 last:border-b-0
							{isMe ? 'bg-teal/10' : i % 2 === 0 ? 'bg-white' : 'bg-[#f9faf5]'}">
							<span class="w-8 text-center font-heading text-lg font-extrabold">{medalEmoji(i)}</span>
							<span class="flex-1 font-heading font-semibold capitalize {isMe ? 'text-teal' : 'text-black'}">
								{player.name}{isMe ? ' (you)' : ''}
							</span>
							<span class="font-heading text-xl font-extrabold">{player.totalScore}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>

	<!-- ═══════════ FINISHED ═══════════ -->
	{:else if mp.room.phase === 'finished'}
		<div class="mx-auto max-w-2xl px-4 py-10">

			<!-- winner card -->
			<div class="relative mb-8 text-center">
				<div class="absolute -bottom-3 -right-3 h-full w-full rounded-2xl border-[5px] border-black bg-purple"></div>
				<div class="relative rounded-2xl border-[5px] border-black bg-white p-8">
					<p class="text-6xl">🏆</p>
					<h2 class="mt-3 font-heading text-4xl font-extrabold">Game Over!</h2>
					{#if sortedPlayers[0]}
						<p class="mt-2 font-heading text-lg font-semibold text-gray-600">
							Winner: <span class="text-purple capitalize">{sortedPlayers[0].name}</span>
							with <strong>{sortedPlayers[0].totalScore} pts</strong>
						</p>
					{/if}
					{#if mp.myPlayer}
						<p class="mt-1 text-sm text-gray-400">
							Your score: <strong>{mp.myPlayer.totalScore} pts</strong>
						</p>
					{/if}
				</div>
			</div>

			<!-- final leaderboard -->
			<h3 class="mb-4 font-heading text-2xl font-extrabold">Final Standings</h3>
			<div class="mb-8 overflow-hidden rounded-2xl border-[4px] border-black bg-white">
				{#each sortedPlayers as player, i}
					{@const isMe = player.id === mp.playerId}
					<div class="flex items-center gap-4 border-b-[3px] border-black px-5 py-4 last:border-b-0
						{isMe ? 'bg-teal/10' : i % 2 === 0 ? 'bg-white' : 'bg-[#f9faf5]'}">
						<span class="w-10 text-center font-heading text-2xl font-extrabold">{medalEmoji(i)}</span>
						<div class="flex-1">
							<p class="font-heading font-bold capitalize {isMe ? 'text-teal' : 'text-black'}">
								{player.name}{isMe ? ' (you)' : ''}
							</p>
							<!-- per-round score dots -->
							<div class="mt-1 flex gap-1">
								{#each player.roundScores as rs}
									<div class="h-2.5 w-2.5 rounded-full border border-black {scoreBarColor(rs)}"></div>
								{/each}
							</div>
						</div>
						<div class="text-right">
							<p class="font-heading text-2xl font-extrabold">{player.totalScore}</p>
							<p class="text-xs text-gray-400">/ 600 pts</p>
						</div>
					</div>
				{/each}
			</div>

			<!-- actions -->
			<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
				<button
					onclick={leaveRoom}
					class="rounded-xl border-[3px] border-black bg-teal px-8 py-3 font-heading font-bold text-white shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000]"
				>
					Back to Lobby
				</button>
				<a
					href="/game"
					class="rounded-xl border-[3px] border-black bg-white px-8 py-3 text-center font-heading font-bold text-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000]"
				>
					Solo Practice →
				</a>
			</div>
		</div>
	{/if}
</div>
