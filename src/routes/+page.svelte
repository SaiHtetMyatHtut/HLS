<script lang="ts">
	import { rounds, type FoodCard, type Round } from '$lib/game-data';

	type GameState = 'start' | 'playing' | 'feedback' | 'results';

	let state = $state<GameState>('start');
	let currentIndex = $state(0);
	let score = $state(0);
	let selectedSide = $state<'a' | 'b' | null>(null);
	let wasCorrect = $state(false);
	let shuffledRounds = $state<Round[]>([]);
	const totalRounds = 5;

	function startGame() {
		const shuffled = [...rounds].sort(() => Math.random() - 0.5);
		shuffledRounds = shuffled.slice(0, totalRounds);
		currentIndex = 0;
		score = 0;
		selectedSide = null;
		state = 'playing';
	}

	function pickCard(side: 'a' | 'b') {
		if (state !== 'playing') return;
		const round = shuffledRounds[currentIndex];
		const picked = side === 'a' ? round.optionA : round.optionB;
		selectedSide = side;
		wasCorrect = picked.isHealthier === true;
		if (wasCorrect) score++;
		state = 'feedback';
	}

	function nextRound() {
		selectedSide = null;
		if (currentIndex + 1 < totalRounds) {
			currentIndex++;
			state = 'playing';
		} else {
			state = 'results';
		}
	}

	let currentRound = $derived(shuffledRounds[currentIndex]);
	let progressPercent = $derived(((currentIndex + (state === 'feedback' ? 1 : 0)) / totalRounds) * 100);

	function getResultMessage(s: number, total: number): string {
		const pct = s / total;
		if (pct === 1) return 'Perfect score! You really know your nutrition!';
		if (pct >= 0.8) return 'Great job! You have solid nutrition knowledge!';
		if (pct >= 0.6) return 'Not bad! Keep learning about healthy choices!';
		return "There's room to grow — every choice is a chance to learn!";
	}
</script>

<svelte:head>
	<title>HealthyPick — Choose the Healthier Option!</title>
</svelte:head>

<div class="min-h-screen bg-cream font-body">
	<!-- decorative shapes -->
	<div class="pointer-events-none fixed -left-16 -top-16 h-48 w-48 rotate-12 rounded-lg border-[5px] border-black bg-purple opacity-40"></div>
	<div class="pointer-events-none fixed -bottom-12 -right-12 h-40 w-40 -rotate-12 rounded-lg border-[5px] border-black bg-teal opacity-40"></div>
	<div class="pointer-events-none fixed right-24 top-20 h-20 w-20 rotate-45 border-[5px] border-black bg-yellow opacity-30"></div>

	{#if state === 'start'}
		<!-- START SCREEN -->
		<div class="flex min-h-screen flex-col items-center justify-center px-4">
			<div class="relative max-w-lg text-center">
				<!-- accent card behind -->
				<div class="absolute -left-4 -top-4 h-full w-full rounded-2xl border-[5px] border-black bg-teal"></div>
				<div class="relative rounded-2xl border-[5px] border-black bg-white p-10">
					<p class="mb-2 text-6xl">🥦 vs 🍩</p>
					<h1 class="font-heading text-4xl font-extrabold text-black sm:text-5xl">HealthyPick</h1>
					<p class="mt-3 font-heading text-lg font-semibold text-teal">Can you spot the healthier choice?</p>
					<p class="mt-4 text-gray-600">
						You'll see two food cards each round. Pick the healthier one!
						<br />
						<strong>{totalRounds} rounds</strong> — let's see how well you know your nutrition.
					</p>
					<button
						onclick={startGame}
						class="mt-8 rounded-xl border-[4px] border-black bg-purple px-10 py-3 font-heading text-lg font-bold text-white shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
					>
						Start Game
					</button>
				</div>
			</div>
		</div>

	{:else if state === 'playing' || state === 'feedback'}
		<!-- GAME SCREEN -->
		<div class="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8">
			<!-- header -->
			<div class="mb-6 flex items-center justify-between">
				<h2 class="font-heading text-2xl font-bold">
					Round {currentIndex + 1}<span class="text-gray-400">/{totalRounds}</span>
				</h2>
				<div class="flex items-center gap-3">
					<span class="font-heading text-lg font-semibold">Score: {score}</span>
					<div class="flex gap-1">
						{#each Array(totalRounds) as _, i}
							<div
								class="h-3 w-3 rounded-full border-2 border-black {i < score ? 'bg-teal' : i < currentIndex + (state === 'feedback' ? 1 : 0) ? 'bg-coral' : 'bg-gray-200'}"
							></div>
						{/each}
					</div>
				</div>
			</div>

			<!-- progress bar -->
			<div class="mb-8 h-3 overflow-hidden rounded-full border-[3px] border-black bg-gray-200">
				<div
					class="h-full rounded-full bg-teal transition-all duration-500"
					style="width: {progressPercent}%"
				></div>
			</div>

			<!-- prompt -->
			<p class="mb-6 text-center font-heading text-xl font-semibold text-gray-700">
				{#if state === 'playing'}
					Which one is healthier? Tap to choose!
				{:else}
					{wasCorrect ? '✅ Correct!' : '❌ Not quite!'}
				{/if}
			</p>

			<!-- cards -->
			{#if currentRound}
				<div class="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2">
					{@render foodCard(currentRound.optionA, 'a')}
					{@render foodCard(currentRound.optionB, 'b')}
				</div>
			{/if}

			<!-- feedback explanation -->
			{#if state === 'feedback' && currentRound}
				<div class="mt-6 rounded-xl border-[4px] border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000]">
					<p class="font-heading text-sm font-semibold text-gray-500">💡 Did you know?</p>
					<p class="mt-1 text-gray-700">{currentRound.explanation}</p>
					<button
						onclick={nextRound}
						class="mt-4 rounded-lg border-[3px] border-black bg-purple px-8 py-2 font-heading font-bold text-white shadow-[3px_3px_0px_0px_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000]"
					>
						{currentIndex + 1 < totalRounds ? 'Next Round →' : 'See Results →'}
					</button>
				</div>
			{/if}
		</div>

	{:else if state === 'results'}
		<!-- RESULTS SCREEN -->
		<div class="flex min-h-screen flex-col items-center justify-center px-4">
			<div class="relative max-w-md text-center">
				<div class="absolute -left-4 -top-4 h-full w-full rounded-2xl border-[5px] border-black bg-purple"></div>
				<div class="relative rounded-2xl border-[5px] border-black bg-white p-10">
					<p class="text-6xl">{score === totalRounds ? '🏆' : score >= 3 ? '🌟' : '💪'}</p>
					<h2 class="mt-4 font-heading text-3xl font-extrabold">
						{score} / {totalRounds}
					</h2>
					<p class="mt-3 text-lg text-gray-600">{getResultMessage(score, totalRounds)}</p>

					<!-- score dots -->
					<div class="mt-5 flex justify-center gap-2">
						{#each Array(totalRounds) as _, i}
							<div
								class="h-5 w-5 rounded-full border-[3px] border-black {i < score ? 'bg-teal' : 'bg-coral'}"
							></div>
						{/each}
					</div>

					<button
						onclick={startGame}
						class="mt-8 rounded-xl border-[4px] border-black bg-teal px-10 py-3 font-heading text-lg font-bold text-white shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
					>
						Play Again
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

{#snippet foodCard(card: FoodCard, side: 'a' | 'b')}
	{@const isSelected = selectedSide === side}
	{@const isCorrectCard = card.isHealthier === true}
	{@const showResult = state === 'feedback'}
	{@const accentColor = side === 'a' ? 'bg-teal' : 'bg-purple'}

	<button
		onclick={() => pickCard(side)}
		disabled={state !== 'playing'}
		class="group relative text-left transition-transform {state === 'playing' ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default'}"
	>
		<!-- offset accent behind card -->
		<div class="absolute -bottom-2 -right-2 h-full w-full rounded-2xl border-[4px] border-black {accentColor}"></div>

		<div
			class="relative flex h-full flex-col rounded-2xl border-[4px] border-black bg-white p-6 transition-shadow
				{showResult && isCorrectCard ? 'ring-4 ring-teal' : ''}
				{showResult && isSelected && !isCorrectCard ? 'ring-4 ring-coral' : ''}
				{!showResult ? 'group-hover:shadow-lg' : ''}"
		>
			<!-- emoji -->
			<p class="text-center text-7xl sm:text-8xl">{card.emoji}</p>

			<!-- name -->
			<h3 class="mt-4 text-center font-heading text-xl font-bold text-black">{card.name}</h3>

			<!-- description -->
			<p class="mt-2 flex-1 text-center text-sm text-gray-600">{card.description}</p>

			<!-- calorie badge -->
			<div class="mt-4 flex justify-center">
				<span class="rounded-full border-[3px] border-black bg-yellow px-4 py-1 font-heading text-sm font-bold">
					{card.calories} cal
				</span>
			</div>

			<!-- result indicator -->
			{#if showResult}
				<div class="mt-3 text-center font-heading text-sm font-bold {isCorrectCard ? 'text-teal' : 'text-coral'}">
					{isCorrectCard ? '✅ Healthier choice!' : ''}
					{isSelected && !isCorrectCard ? '❌ Less healthy' : ''}
				</div>
			{/if}
		</div>
	</button>
{/snippet}
