<script lang="ts">
	import { auth } from '$lib/auth.svelte';
	import { leaderboard } from '$lib/leaderboard.svelte';
	import {
		challenges,
		calcRoundPoints,
		getMaxScore,
		getOptimalIngredients,
		getScoreColor,
		getScoreLabel,
		categoryMeta,
		type Ingredient,
		type DishChallenge
	} from '$lib/game-data';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!auth.isLoggedIn) goto('/auth');
	});

	type Phase = 'picking' | 'feedback' | 'results';

	// ── game state ──────────────────────────────────────────
	let challengeIndex: number = $state(0);
	let phase: Phase = $state('picking');
	let selectedIds: string[] = $state([]);
	let roundPoints: number[] = $state([]);
	let shuffledChallenges: DishChallenge[] = $state([]);
	let scoreSaved: boolean = $state(false);

	const TOTAL_ROUNDS = 5;
	const MAX_TOTAL = 500; // 5 rounds × 100 pts each

	function shuffleIngredients(c: DishChallenge): DishChallenge {
		return { ...c, ingredients: [...c.ingredients].sort(() => Math.random() - 0.5) };
	}

	function initGame(): void {
		shuffledChallenges = [...challenges]
			.sort(() => Math.random() - 0.5)
			.slice(0, TOTAL_ROUNDS)
			.map(shuffleIngredients);
		challengeIndex = 0;
		phase = 'picking';
		selectedIds = [];
		roundPoints = [];
		scoreSaved = false;
	}

	onMount(initGame);

	// ── derived ─────────────────────────────────────────────
	let current: DishChallenge = $derived(shuffledChallenges[challengeIndex] ?? challenges[0]);
	let totalScore: number = $derived(roundPoints.reduce((s, p) => s + p, 0));
	let maxThisRound: number = $derived(getMaxScore(current));
	let optimalPicks: Ingredient[] = $derived(getOptimalIngredients(current));

	// ── actions ─────────────────────────────────────────────
	function toggleIngredient(id: string): void {
		if (phase !== 'picking') return;
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((x) => x !== id);
		} else if (selectedIds.length < current.pickCount) {
			selectedIds = [...selectedIds, id];
		}
	}

	function submitDish(): void {
		if (selectedIds.length < current.pickCount) return;
		const pts = calcRoundPoints(current, selectedIds);
		roundPoints = [...roundPoints, pts];
		phase = 'feedback';
	}

	function nextRound(): void {
		if (challengeIndex + 1 < TOTAL_ROUNDS) {
			challengeIndex++;
			selectedIds = [];
			phase = 'picking';
		} else {
			phase = 'results';
			if (auth.user && !scoreSaved) {
				leaderboard.addEntry(auth.user.name, totalScore);
				scoreSaved = true;
			}
		}
	}

	function progressPct(idx: number, ph: Phase): number {
		return ((idx + (ph === 'feedback' ? 1 : 0)) / TOTAL_ROUNDS) * 100;
	}

	function gradeMessage(score: number): string {
		const pct = score / MAX_TOTAL;
		if (pct >= 0.96) return 'Perfect! You\'re a nutrition master! 🧑‍🍳';
		if (pct >= 0.80) return 'Excellent choices! Your gut will thank you! 🌟';
		if (pct >= 0.60) return 'Good effort! Keep learning about healthy foods! 💪';
		return 'Room to grow — every meal is a chance to do better! 🌱';
	}

	function rankSuffix(n: number): string {
		if (n === 1) return '🥇';
		if (n === 2) return '🥈';
		if (n === 3) return '🥉';
		return `#${n}`;
	}
</script>

<svelte:head>
	<title>HealthyPick — Play</title>
</svelte:head>

<div class="min-h-[calc(100vh-68px)] bg-[#f9faf5] font-body">

	<!-- ═══════════════ RESULTS ═══════════════ -->
	{#if phase === 'results'}
		<div class="mx-auto max-w-3xl px-4 py-10">
			<!-- score card -->
			<div class="relative mb-10">
				<div class="absolute -bottom-3 -right-3 h-full w-full rounded-2xl border-[5px] border-black bg-purple"></div>
				<div class="relative rounded-2xl border-[5px] border-black bg-white p-8 text-center">
					<p class="text-6xl">{totalScore >= 480 ? '🏆' : totalScore >= 380 ? '🌟' : totalScore >= 280 ? '💪' : '🌱'}</p>
					<h2 class="mt-3 font-heading text-5xl font-extrabold">
						{totalScore}<span class="text-gray-300 text-3xl">/{MAX_TOTAL}</span>
					</h2>
					<p class="mt-2 text-gray-500 font-heading text-sm">Your total health score</p>
					<p class="mt-3 font-heading text-lg font-semibold text-gray-700">{gradeMessage(totalScore)}</p>

					<!-- per-round breakdown -->
					<div class="mt-6 flex justify-center gap-3 flex-wrap">
						{#each roundPoints as pts, i}
							<div class="rounded-xl border-[3px] border-black px-4 py-2 text-sm font-heading font-bold {pts >= 80 ? 'bg-teal/20 text-teal' : pts >= 50 ? 'bg-yellow/30 text-yellow-700' : 'bg-red-50 text-[#f87171]'}">
								R{i + 1}: {pts}/100
							</div>
						{/each}
					</div>

					<div class="mt-6 flex flex-wrap justify-center gap-4">
						<button
							onclick={initGame}
							class="rounded-xl border-[4px] border-black bg-teal px-8 py-3 font-heading font-bold text-white shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000]"
						>
							Play Again
						</button>
						<a
							href="/leaderboard"
							class="rounded-xl border-[4px] border-black bg-white px-8 py-3 font-heading font-bold text-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000]"
						>
							Full Leaderboard →
						</a>
					</div>
				</div>
			</div>

			<!-- leaderboard preview -->
			<h3 class="mb-4 font-heading text-2xl font-extrabold">🏆 Top 10 Leaderboard</h3>
			<div class="overflow-hidden rounded-2xl border-[4px] border-black bg-white">
				{#each leaderboard.top10 as entry, i}
					{@const isYou = auth.user?.name === entry.name && entry.score === totalScore}
					<div
						class="flex items-center gap-4 border-b-[3px] border-black px-5 py-3 last:border-b-0
							{isYou ? 'bg-teal/10' : i % 2 === 0 ? 'bg-white' : 'bg-[#f9faf5]'}"
					>
						<span class="w-10 text-center font-heading text-xl font-extrabold">
							{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
						</span>
						<span class="flex-1 font-heading font-semibold capitalize {isYou ? 'text-teal' : 'text-black'}">
							{entry.name}{isYou ? ' (you)' : ''}
						</span>
						<span class="font-heading font-bold">{entry.score}<span class="text-gray-400 text-xs">/{MAX_TOTAL}</span></span>
						<span class="hidden text-xs text-gray-400 sm:block">{entry.date}</span>
					</div>
				{/each}
			</div>
		</div>

	<!-- ═══════════════ GAME ═══════════════ -->
	{:else}
		<div class="mx-auto flex min-h-[calc(100vh-68px)] max-w-5xl flex-col px-4 py-6">

			<!-- top bar -->
			<div class="mb-3 flex items-center justify-between">
				<p class="font-heading text-lg font-bold">
					Round {challengeIndex + 1}<span class="text-gray-400">/{TOTAL_ROUNDS}</span>
				</p>
				<div class="flex items-center gap-2">
					<span class="font-heading font-semibold text-sm">Score: {totalScore}</span>
					<div class="flex gap-1">
						{#each Array(TOTAL_ROUNDS) as _, i}
							<div class="h-3 w-3 rounded-full border-2 border-black
								{i < roundPoints.length
									? roundPoints[i] >= 80 ? 'bg-teal' : roundPoints[i] >= 50 ? 'bg-yellow' : 'bg-[#f87171]'
									: 'bg-gray-200'}">
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- progress bar -->
			<div class="mb-5 h-2.5 overflow-hidden rounded-full border-[3px] border-black bg-gray-200">
				<div
					class="h-full rounded-full bg-teal transition-all duration-500"
					style="width: {progressPct(challengeIndex, phase)}%"
				></div>
			</div>

			<!-- challenge header -->
			<div class="relative mb-6">
				<div class="absolute -bottom-2 -right-2 h-full w-full rounded-xl border-[3px] border-black bg-purple opacity-60"></div>
				<div class="relative rounded-xl border-[3px] border-black bg-white px-5 py-4">
					<div class="flex items-center gap-3">
						<span class="text-4xl">{current.emoji}</span>
						<div>
							<h2 class="font-heading text-xl font-extrabold leading-tight">{current.title}</h2>
							<p class="text-sm text-gray-500">{current.prompt}</p>
						</div>
					</div>
					{#if phase === 'picking'}
						<p class="mt-2 font-heading text-sm font-bold {selectedIds.length === current.pickCount ? 'text-teal' : 'text-gray-500'}">
							{selectedIds.length}/{current.pickCount} selected
							{selectedIds.length === current.pickCount ? '— ready to submit!' : ''}
						</p>
					{/if}
				</div>
			</div>

			<!-- ── PICKING phase: ingredient grid ── -->
			{#if phase === 'picking'}
				<div class="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
					{#each current.ingredients as ing}
						{@const isSelected = selectedIds.includes(ing.id)}
						{@const isDisabled = !isSelected && selectedIds.length >= current.pickCount}
						<button
							onclick={() => toggleIngredient(ing.id)}
							disabled={isDisabled}
							class="relative flex flex-col items-center rounded-xl border-[3px] border-black p-3 text-center transition-all
								{isSelected
									? 'bg-teal/15 ring-4 ring-teal shadow-[3px_3px_0_0_#46c4b8]'
									: isDisabled
										? 'cursor-not-allowed bg-gray-50 opacity-50'
										: 'bg-white hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000]'}"
						>
							{#if isSelected}
								<span class="absolute right-2 top-2 text-teal text-sm font-bold">✓</span>
							{/if}
							<span class="text-4xl">{ing.emoji}</span>
							<p class="mt-1.5 font-heading text-xs font-bold leading-tight">{ing.name}</p>
							<span class="mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold {categoryMeta[ing.category].color}">
								{categoryMeta[ing.category].label}
							</span>
							<p class="mt-1 text-[10px] text-gray-400">{ing.calories} cal</p>
						</button>
					{/each}
				</div>

				<!-- submit button -->
				<div class="mt-5 flex justify-center">
					<button
						onclick={submitDish}
						disabled={selectedIds.length < current.pickCount}
						class="rounded-xl border-[4px] border-black bg-purple px-10 py-3 font-heading font-bold text-white shadow-[4px_4px_0_0_#000] transition-all
							hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000]
							disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
					>
						Submit Dish →
					</button>
				</div>

			<!-- ── FEEDBACK phase ── -->
			{:else if phase === 'feedback'}
				{@const lastPts = roundPoints[roundPoints.length - 1]}
				{@const isPerfect = lastPts === 100}

				<!-- round score banner -->
				<div class="mb-4 rounded-xl border-[3px] border-black px-5 py-3 text-center
					{lastPts >= 80 ? 'bg-teal/15' : lastPts >= 50 ? 'bg-yellow/20' : 'bg-red-50'}">
					<p class="font-heading text-2xl font-extrabold">
						{isPerfect ? '🎯 Perfect Round!' : lastPts >= 80 ? '⭐ Great picks!' : lastPts >= 50 ? '👍 Not bad!' : '📚 Room to improve!'}
					</p>
					<p class="font-heading text-3xl font-extrabold mt-1">
						{lastPts}<span class="text-gray-400 text-lg">/100 pts</span>
					</p>
				</div>

				<!-- your selections with scores -->
				<p class="mb-2 font-heading text-sm font-bold text-gray-500 uppercase tracking-wide">Your Dish</p>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
					{#each current.ingredients as ing}
						{@const isSelected = selectedIds.includes(ing.id)}
						{@const scoreStyle = getScoreColor(ing.healthScore)}
						{#if isSelected}
							<div class="flex flex-col items-center rounded-xl border-[3px] border-black p-3 text-center bg-white {scoreStyle.includes('teal') ? 'ring-2 ring-teal' : scoreStyle.includes('f87171') ? 'ring-2 ring-[#f87171]' : 'ring-2 ring-yellow-400'}">
								<span class="text-4xl">{ing.emoji}</span>
								<p class="mt-1 font-heading text-xs font-bold leading-tight">{ing.name}</p>
								<div class="mt-1.5 rounded-full border-2 px-2 py-0.5 text-xs font-bold {scoreStyle}">
									{ing.healthScore}/10 — {getScoreLabel(ing.healthScore)}
								</div>
								<p class="mt-1 text-[10px] text-gray-500 line-clamp-2 leading-tight">{ing.benefit}</p>
							</div>
						{/if}
					{/each}
				</div>

				<!-- optimal combination -->
				{#if !isPerfect}
					<div class="mt-5 rounded-xl border-[3px] border-black bg-white p-4">
						<p class="mb-3 font-heading text-sm font-bold text-gray-500 uppercase tracking-wide">🏆 Optimal Combination</p>
						<div class="flex flex-wrap gap-2">
							{#each optimalPicks as ing}
								{@const youPicked = selectedIds.includes(ing.id)}
								<div class="flex items-center gap-1.5 rounded-full border-[2px] border-black px-3 py-1.5 text-sm font-heading font-semibold
									{youPicked ? 'bg-teal/20 text-teal' : 'bg-[#f9faf5] text-gray-600'}">
									<span>{ing.emoji}</span>
									<span>{ing.name}</span>
									<span class="font-bold">{ing.healthScore}/10</span>
									{#if youPicked}<span>✓</span>{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<div class="mt-5 flex justify-center">
					<button
						onclick={nextRound}
						class="rounded-xl border-[4px] border-black bg-purple px-10 py-3 font-heading font-bold text-white shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000]"
					>
						{challengeIndex + 1 < TOTAL_ROUNDS ? 'Next Round →' : 'See Results →'}
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
