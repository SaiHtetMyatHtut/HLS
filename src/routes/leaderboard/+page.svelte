<script lang="ts">
	import { leaderboard } from '$lib/leaderboard.svelte';
	import { auth } from '$lib/auth.svelte';
	import { onMount } from 'svelte';

	onMount(() => leaderboard.load());

	const PAGE_SIZE = 20;

	let search = $state('');
	let page = $state(0);

	// Reset to page 0 whenever search changes
	$effect(() => {
		if (search !== undefined) page = 0;
	});

	let filtered = $derived(
		search.trim()
			? leaderboard.entries.filter((e) =>
					e.name.toLowerCase().includes(search.trim().toLowerCase())
				)
			: leaderboard.entries
	);

	let paginated = $derived(filtered.slice(0, (page + 1) * PAGE_SIZE));
	let hasMore = $derived(paginated.length < filtered.length);
	let totalShowing = $derived(paginated.length);
	let totalFiltered = $derived(filtered.length);
</script>

<svelte:head>
	<title>HealthyPick — Leaderboard</title>
</svelte:head>

<div class="min-h-[calc(100vh-68px)] bg-[#f9faf5] font-body">
	<div class="mx-auto max-w-3xl px-4 py-12">

		<!-- header -->
		<div class="mb-10 text-center">
			<p class="text-5xl">🏆</p>
			<h1 class="mt-3 font-heading text-4xl font-extrabold text-black">Leaderboard</h1>
			<p class="mt-2 text-gray-500">
				{leaderboard.loading ? 'Loading…' : `${leaderboard.entries.length} records · top nutrition champions`}
			</p>
		</div>

		<!-- podium top 3 -->
		{#if leaderboard.top10.length >= 3}
			<div class="mb-10 flex items-end justify-center gap-4">
				<!-- 2nd -->
				<div class="flex flex-col items-center">
					<div class="flex h-12 w-12 items-center justify-center rounded-full border-[4px] border-black bg-gray-300 font-heading text-2xl font-extrabold text-white shadow-[3px_3px_0_0_#000]">
						🥈
					</div>
					<div class="relative mt-2 w-28">
						<div class="absolute -bottom-1.5 -right-1.5 h-full w-full rounded-t-xl border-[3px] border-black bg-gray-200"></div>
						<div class="relative rounded-t-xl border-[3px] border-black bg-white px-2 py-3 text-center h-24 flex flex-col justify-center">
							<p class="font-heading text-xs font-bold capitalize leading-tight">{leaderboard.top10[1].name}</p>
							<p class="mt-1 font-heading text-xl font-extrabold">{leaderboard.top10[1].score}</p>
						</div>
					</div>
					<div class="h-16 w-28 rounded-b-xl border-[3px] border-t-0 border-black bg-gray-200 flex items-center justify-center font-heading font-extrabold text-gray-500 text-2xl">
						2
					</div>
				</div>

				<!-- 1st (tallest) -->
				<div class="flex flex-col items-center">
					<div class="flex h-14 w-14 items-center justify-center rounded-full border-[4px] border-black bg-yellow font-heading text-3xl font-extrabold shadow-[3px_3px_0_0_#000]">
						🥇
					</div>
					<div class="relative mt-2 w-32">
						<div class="absolute -bottom-1.5 -right-1.5 h-full w-full rounded-t-xl border-[3px] border-black bg-teal opacity-70"></div>
						<div class="relative rounded-t-xl border-[3px] border-black bg-white px-2 py-4 text-center h-28 flex flex-col justify-center">
							<p class="font-heading text-xs font-bold capitalize leading-tight">{leaderboard.top10[0].name}</p>
							<p class="mt-1 font-heading text-2xl font-extrabold">{leaderboard.top10[0].score}</p>
						</div>
					</div>
					<div class="h-24 w-32 rounded-b-xl border-[3px] border-t-0 border-black bg-teal/30 flex items-center justify-center font-heading font-extrabold text-teal text-2xl">
						1
					</div>
				</div>

				<!-- 3rd -->
				<div class="flex flex-col items-center">
					<div class="flex h-12 w-12 items-center justify-center rounded-full border-[4px] border-black bg-orange-300 font-heading text-2xl font-extrabold shadow-[3px_3px_0_0_#000]">
						🥉
					</div>
					<div class="relative mt-2 w-28">
						<div class="absolute -bottom-1.5 -right-1.5 h-full w-full rounded-t-xl border-[3px] border-black bg-orange-200"></div>
						<div class="relative rounded-t-xl border-[3px] border-black bg-white px-2 py-3 text-center h-20 flex flex-col justify-center">
							<p class="font-heading text-xs font-bold capitalize leading-tight">{leaderboard.top10[2].name}</p>
							<p class="mt-1 font-heading text-xl font-extrabold">{leaderboard.top10[2].score}</p>
						</div>
					</div>
					<div class="h-12 w-28 rounded-b-xl border-[3px] border-t-0 border-black bg-orange-200 flex items-center justify-center font-heading font-extrabold text-orange-500 text-2xl">
						3
					</div>
				</div>
			</div>
		{/if}

		<!-- search bar -->
		<div class="mb-4 flex items-center gap-3">
			<div class="relative flex-1">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
				<input
					type="text"
					bind:value={search}
					placeholder="Search by player name…"
					class="w-full rounded-xl border-[3px] border-black bg-white py-2.5 pl-10 pr-4 font-heading font-semibold text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple"
				/>
			</div>
			{#if search}
				<button
					onclick={() => (search = '')}
					class="rounded-xl border-[3px] border-black bg-white px-4 py-2.5 font-heading text-sm font-bold hover:bg-gray-50"
				>
					Clear
				</button>
			{/if}
		</div>

		<!-- results count -->
		{#if search}
			<p class="mb-3 text-sm text-gray-500 font-heading">
				{totalFiltered === 0 ? 'No results for' : `${totalFiltered} result${totalFiltered === 1 ? '' : 's'} for`}
				<strong>"{search}"</strong>
			</p>
		{/if}

		<!-- full table -->
		<div class="overflow-hidden rounded-2xl border-[4px] border-black bg-white shadow-[5px_5px_0_0_#000]">
			<!-- table header -->
			<div class="flex items-center gap-4 border-b-[4px] border-black bg-purple px-5 py-3">
				<span class="w-10 text-center font-heading text-sm font-bold text-white">Rank</span>
				<span class="flex-1 font-heading text-sm font-bold text-white">Player</span>
				<span class="font-heading text-sm font-bold text-white">Score</span>
				<span class="hidden font-heading text-sm font-bold text-white sm:block">%</span>
				<span class="hidden font-heading text-sm font-bold text-white sm:block">Date</span>
			</div>

			{#if leaderboard.loading}
				<div class="flex items-center justify-center py-16">
					<div class="h-8 w-8 animate-spin rounded-full border-4 border-purple border-t-transparent"></div>
				</div>
			{:else if leaderboard.loadError}
				<div class="py-10 text-center text-sm text-red-500">{leaderboard.loadError}</div>
			{:else if paginated.length === 0}
				<div class="py-16 text-center">
					<p class="text-4xl mb-3">🤷</p>
					<p class="font-heading font-semibold text-gray-500">No players found matching "{search}"</p>
				</div>
			{:else}
				{#each paginated as entry, i}
					{@const globalRank = leaderboard.entries.indexOf(entry)}
					{@const isYou = auth.isLoggedIn && auth.user?.name?.toLowerCase() === entry.name.toLowerCase()}
					{@const pct = Math.round((entry.score / 500) * 100)}
					<div
						class="flex items-center gap-4 border-b-[2px] border-gray-100 px-5 py-3.5 last:border-b-0
							{isYou ? 'bg-teal/10' : i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}"
					>
						<!-- rank -->
						<span class="w-10 text-center font-heading text-xl font-extrabold">
							{globalRank === 0 ? '🥇' : globalRank === 1 ? '🥈' : globalRank === 2 ? '🥉' : globalRank + 1}
						</span>

						<!-- name -->
						<div class="flex flex-1 items-center gap-2">
							<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-[2px] border-black bg-teal font-heading text-sm font-bold uppercase text-white">
								{entry.name[0]}
							</div>
							<span class="font-heading font-semibold capitalize {isYou ? 'text-teal' : 'text-black'}">
								{entry.name}{isYou ? ' ← you' : ''}
							</span>
						</div>

						<!-- score -->
						<span class="font-heading text-lg font-extrabold">
							{entry.score}<span class="text-xs font-normal text-gray-400">/500</span>
						</span>

						<!-- pct bar -->
						<div class="hidden items-center gap-2 sm:flex w-20">
							<div class="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
								<div class="h-full rounded-full bg-teal" style="width: {pct}%"></div>
							</div>
							<span class="text-xs text-gray-500 font-heading font-semibold w-8">{pct}%</span>
						</div>

						<!-- date -->
						<span class="hidden text-xs text-gray-400 sm:block w-20 text-right">{entry.date}</span>
					</div>
				{/each}
			{/if}
		</div>

		<!-- load more / count -->
		{#if !leaderboard.loading && paginated.length > 0}
			<div class="mt-4 flex items-center justify-between">
				<p class="text-sm text-gray-400 font-heading">
					Showing <strong>{totalShowing}</strong> of <strong>{totalFiltered}</strong> records
				</p>
				{#if hasMore}
					<button
						onclick={() => page++}
						class="rounded-xl border-[3px] border-black bg-white px-6 py-2 font-heading text-sm font-bold shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000]"
					>
						Load More ↓
					</button>
				{/if}
			</div>
		{/if}

		<!-- CTA -->
		<div class="mt-10 text-center">
			{#if auth.isLoggedIn}
				<p class="mb-4 text-gray-600">Think you can beat the top score?</p>
				<a
					href="/game"
					class="inline-block rounded-xl border-[4px] border-black bg-purple px-10 py-3 font-heading text-lg font-bold text-white shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000]"
				>
					▶ Play Now
				</a>
			{:else}
				<p class="mb-4 text-gray-600">Join the competition!</p>
				<a
					href="/auth"
					class="inline-block rounded-xl border-[4px] border-black bg-teal px-10 py-3 font-heading text-lg font-bold text-white shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000]"
				>
					Sign Up & Play Free →
				</a>
			{/if}
		</div>

	</div>
</div>
