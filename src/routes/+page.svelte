<script lang="ts">
	import { auth } from '$lib/auth.svelte';
	import { blogPosts } from '$lib/blog-data';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	function handlePlay() {
		if (auth.isLoggedIn) {
			goto('/game');
		} else {
			goto('/auth');
		}
	}

	// highlight Blog nav when section is visible
	let blogSection: HTMLElement;
	onMount(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				// dispatch custom event the layout can listen for if needed
				if (entry.isIntersecting) {
					history.replaceState(null, '', '/#blog');
				}
			},
			{ threshold: 0.3 }
		);
		if (blogSection) observer.observe(blogSection);
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>HealthyPick — Make Smarter Food Choices</title>
</svelte:head>

<main class="overflow-x-hidden bg-[#f9faf5] font-body">
	<!-- ─── HERO ─────────────────────────────────────────── -->
	<section class="relative min-h-[88vh] px-4 pb-24 pt-20">
		<!-- decorative blobs -->
		<div class="pointer-events-none absolute -left-20 top-10 h-64 w-64 -rotate-12 rounded-3xl border-[5px] border-black bg-teal opacity-30"></div>
		<div class="pointer-events-none absolute -right-16 top-24 h-48 w-48 rotate-12 rounded-3xl border-[5px] border-black bg-purple opacity-30"></div>
		<div class="pointer-events-none absolute bottom-16 left-1/3 h-32 w-32 rotate-45 border-[5px] border-black bg-yellow opacity-25"></div>

		<div class="relative mx-auto max-w-5xl">
			<div class="grid items-center gap-12 lg:grid-cols-2">
				<!-- text side -->
				<div>
					<span class="inline-block rounded-full border-[3px] border-black bg-yellow px-4 py-1 font-heading text-sm font-bold">
						🌱 Health Campaign 2026
					</span>
					<h1 class="mt-4 font-heading text-5xl font-extrabold leading-tight text-black sm:text-6xl">
						Build the<br />
						<span class="relative inline-block">
							<span class="relative z-10">Healthiest</span>
							<span class="absolute bottom-1 left-0 z-0 h-4 w-full -skew-x-3 bg-teal"></span>
						</span>
						<br />Dish.
					</h1>
					<p class="mt-6 max-w-md text-lg text-gray-600">
						Each round presents real ingredients. You pick the combo. The healthier your choices,
						the higher your score — and your spot on the leaderboard.
					</p>
					<div class="mt-8 flex flex-wrap gap-4">
						<button
							onclick={handlePlay}
							class="rounded-xl border-[4px] border-black bg-purple px-8 py-3 font-heading text-lg font-bold text-white shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#000] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none"
						>
							{auth.isLoggedIn ? '▶ Continue Playing' : '▶ Play Now — It\'s Free'}
						</button>
						<a
							href="#how-it-works"
							onclick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}
							class="rounded-xl border-[4px] border-black bg-white px-8 py-3 font-heading text-lg font-bold text-black shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#000]"
						>
							Learn More
						</a>
					</div>
					{#if auth.isLoggedIn}
						<p class="mt-4 font-heading text-sm font-semibold text-teal">
							Welcome back, <span class="capitalize">{auth.user?.name}</span>! 👋
						</p>
					{/if}
				</div>

				<!-- visual cards side -->
				<!-- Dish builder preview -->
				<div class="flex flex-col gap-3">
					<div class="relative">
						<div class="absolute -bottom-2 -right-2 h-full w-full rounded-2xl border-[4px] border-black bg-teal opacity-70"></div>
						<div class="relative rounded-2xl border-[4px] border-black bg-white p-4">
							<p class="font-heading text-xs font-bold text-gray-400 mb-2">🥗 Build the Healthiest Salad — pick 5</p>
							<div class="grid grid-cols-3 gap-2">
								{#each [
									{ e: '🥬', n: 'Mixed Greens', s: 9, sel: true },
									{ e: '🥑', n: 'Avocado', s: 8, sel: true },
									{ e: '🍗', n: 'Grilled Chicken', s: 9, sel: true },
									{ e: '🍅', n: 'Cherry Tomatoes', s: 8, sel: false },
									{ e: '🥓', n: 'Bacon Bits', s: 2, sel: false },
									{ e: '🫙', n: 'Ranch Dressing', s: 2, sel: false },
								] as ing}
									<div class="rounded-lg border-[2px] border-black p-2 text-center text-xs {ing.sel ? 'bg-teal/15 ring-2 ring-teal' : 'bg-gray-50 opacity-60'}">
										<span class="text-2xl block">{ing.e}</span>
										<p class="mt-0.5 font-heading font-bold leading-tight text-[10px]">{ing.n}</p>
										{#if ing.sel}
											<span class="text-teal text-[10px] font-bold">{ing.s}/10 ✓</span>
										{/if}
									</div>
								{/each}
							</div>
							<div class="mt-2 text-center font-heading text-xs font-bold text-teal">3/5 selected…</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ─── HOW IT WORKS ─────────────────────────────────── -->
	<section id="how-it-works" class="bg-white px-4 py-20">
		<div class="mx-auto max-w-5xl">
			<div class="mb-12 text-center">
				<h2 class="font-heading text-4xl font-extrabold text-black">How It Works</h2>
				<p class="mt-3 text-gray-500">Three simple steps to better nutrition choices</p>
			</div>

			<div class="grid gap-8 sm:grid-cols-3">
				{#each [
					{ step: '01', title: 'Sign Up Free', desc: 'Create your account in seconds — no credit card needed.', emoji: '✍️', color: 'bg-purple' },
					{ step: '02', title: 'Build Your Dish', desc: 'Each round gives you ingredients. Pick the healthiest combo to score points!', emoji: '🍱', color: 'bg-teal' },
					{ step: '03', title: 'Climb the Board', desc: 'Scores are saved to the leaderboard. Can you reach the top 10?', emoji: '🏆', color: 'bg-yellow' }
				] as s}
					<div class="relative">
						<div class="absolute -bottom-2 -right-2 h-full w-full rounded-2xl border-[4px] border-black {s.color} opacity-70"></div>
						<div class="relative rounded-2xl border-[4px] border-black bg-white p-6">
							<span class="font-heading text-5xl font-black text-gray-400">{s.step}</span>
							<p class="mt-2 text-4xl">{s.emoji}</p>
							<h3 class="mt-3 font-heading text-xl font-bold">{s.title}</h3>
							<p class="mt-2 text-sm text-gray-600">{s.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ─── STATS BAND ─────────────────────────────────────── -->
	<section class="border-y-[4px] border-black bg-teal px-4 py-10">
		<div class="mx-auto grid max-w-4xl gap-8 text-center sm:grid-cols-3">
			{#each [
				{ value: '10+', label: 'Food Comparisons' },
				{ value: '5', label: 'Rounds Per Game' },
				{ value: '100%', label: 'Free to Play' }
			] as stat}
				<div>
					<p class="font-heading text-5xl font-extrabold text-white">{stat.value}</p>
					<p class="mt-1 font-heading font-semibold text-white/80">{stat.label}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- ─── BLOG SECTION ──────────────────────────────────── -->
	<section id="blog" bind:this={blogSection} class="px-4 py-20">
		<div class="mx-auto max-w-6xl">
			<div class="mb-12 flex flex-wrap items-end justify-between gap-4">
				<div>
					<h2 class="font-heading text-4xl font-extrabold text-black">Health Blog</h2>
					<p class="mt-2 text-gray-500">Tips, science, and stories to fuel your healthy journey</p>
				</div>
			</div>

			<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each blogPosts as post}
					<a
						href="/blog/{post.slug}"
						class="group relative block no-underline transition-transform hover:-translate-y-1"
					>
						<div class="absolute -bottom-2 -right-2 h-full w-full rounded-2xl border-[4px] border-black {post.accentColor} opacity-70"></div>
						<article class="relative flex h-full flex-col rounded-2xl border-[4px] border-black bg-white p-6 transition-shadow group-hover:shadow-lg">
							<!-- cover -->
							<div class="flex h-24 items-center justify-center rounded-xl border-[3px] border-black bg-[#f9faf5] text-5xl">
								{post.coverEmoji}
							</div>
							<!-- category + date -->
							<div class="mt-4 flex items-center gap-2">
								<span class="rounded-full border-[2px] border-black bg-yellow px-2 py-0.5 font-heading text-xs font-bold">
									{post.category}
								</span>
								<span class="text-xs text-gray-400">{post.readTime}</span>
							</div>
							<!-- title -->
							<h3 class="mt-3 font-heading text-lg font-bold leading-snug text-black">
								{post.title}
							</h3>
							<!-- excerpt -->
							<p class="mt-2 flex-1 text-sm text-gray-600 line-clamp-3">
								{post.excerpt}
							</p>
							<!-- read more -->
							<p class="mt-4 font-heading text-sm font-bold text-black underline underline-offset-2">
								Read article →
							</p>
						</article>
					</a>
				{/each}
			</div>
		</div>
	</section>

	<!-- ─── CTA BAND ──────────────────────────────────────── -->
	<section class="border-t-[4px] border-black bg-purple px-4 py-20">
		<div class="mx-auto max-w-2xl text-center">
			<p class="text-5xl">🏆</p>
			<h2 class="mt-4 font-heading text-4xl font-extrabold text-white">
				Ready to test your nutrition IQ?
			</h2>
			<p class="mt-4 text-lg text-white/80">
				Join the campaign. Pick smarter. Eat better. It starts with one game.
			</p>
			<button
				onclick={handlePlay}
				class="mt-8 rounded-xl border-[4px] border-black bg-white px-10 py-3 font-heading text-lg font-bold text-black shadow-[5px_5px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#000]"
			>
				{auth.isLoggedIn ? '▶ Play Now' : '▶ Sign Up & Play Free'}
			</button>
		</div>
	</section>

	<!-- ─── FOOTER ────────────────────────────────────────── -->
	<footer class="border-t-[4px] border-black bg-white px-4 py-8">
		<div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<span class="text-xl">🥦</span>
				<span class="font-heading font-extrabold text-black">HealthyPick</span>
				<span class="text-sm text-gray-400">— Health Campaign 2026</span>
			</div>
			<p class="text-sm text-gray-400">Made with love for better food choices.</p>
		</div>
	</footer>
</main>
