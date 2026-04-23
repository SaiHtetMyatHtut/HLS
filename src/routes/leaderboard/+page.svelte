<script lang="ts">
	import { leaderboard } from '$lib/leaderboard.svelte';
	import { auth } from '$lib/auth.svelte';
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
			<p class="mt-2 text-gray-500">Top nutrition champions — scores out of 500</p>
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

			{#each leaderboard.top10 as entry, i}
				{@const isYou = auth.isLoggedIn && auth.user?.name?.toLowerCase() === entry.name.toLowerCase()}
				{@const pct = Math.round((entry.score / 500) * 100)}
				<div
					class="flex items-center gap-4 border-b-[2px] border-gray-100 px-5 py-3.5 last:border-b-0
						{isYou ? 'bg-teal/10' : i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}"
				>
					<!-- rank -->
					<span class="w-10 text-center font-heading text-xl font-extrabold">
						{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
					</span>

					<!-- name -->
					<div class="flex flex-1 items-center gap-2">
						<div class="flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-black bg-teal font-heading text-sm font-bold uppercase text-white">
							{entry.name[0]}
						</div>
						<span class="font-heading font-semibold capitalize {isYou ? 'text-teal' : 'text-black'}">
							{entry.name}{isYou ? ' ← you' : ''}
						</span>
					</div>

					<!-- score -->
					<span class="font-heading text-lg font-extrabold">
						{entry.score}<span class="text-gray-400 text-xs font-normal">/500</span>
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
		</div>

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
