<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { auth } from '$lib/auth.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { children } = $props();

	let mobileOpen = $state(false);

	function handleLogout() {
		auth.logout();
		goto('/');
	}

	let isHome = $derived(page.url.pathname === '/');
	let activeSection = $state<string>('');

	function scrollToBlog() {
		if (isHome) {
			document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });
		} else {
			goto('/#blog');
		}
		mobileOpen = false;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- sticky nav -->
<header class="sticky top-0 z-50 border-b-[4px] border-black bg-white">
	<nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
		<!-- logo -->
		<a href="/" class="flex items-center gap-2 no-underline" onclick={() => (mobileOpen = false)}>
			<span class="text-2xl">🥦</span>
			<span class="font-heading text-xl font-extrabold text-black">HealthyPick</span>
		</a>

		<!-- desktop links -->
		<div class="hidden items-center gap-6 md:flex">
			<a
				href="/"
				class="font-heading font-semibold text-black transition-colors hover:text-teal {page.url.pathname === '/' ? 'text-teal underline underline-offset-4' : ''}"
			>
				Home
			</a>
			<button
				onclick={scrollToBlog}
				class="font-heading font-semibold text-black transition-colors hover:text-teal"
			>
				Blog
			</button>
			<a
				href="/leaderboard"
				class="font-heading font-semibold text-black transition-colors hover:text-teal {page.url.pathname === '/leaderboard' ? 'text-teal underline underline-offset-4' : ''}"
			>
				Leaderboard
			</a>

			{#if auth.isLoggedIn}
				<a
					href="/game"
					class="rounded-lg border-[3px] border-black bg-purple px-5 py-1.5 font-heading font-bold text-white shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000]"
				>
					Play Game
				</a>
				<div class="flex items-center gap-2">
					<div class="flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-black bg-teal font-heading font-bold uppercase text-white">
						{auth.user?.name[0]}
					</div>
					<span class="max-w-[100px] truncate font-heading text-sm font-semibold capitalize">{auth.user?.name}</span>
				</div>
				<button
					onclick={handleLogout}
					class="font-heading text-sm font-semibold text-gray-500 underline underline-offset-2 hover:text-black"
				>
					Logout
				</button>
			{:else}
				<a
					href="/game"
					onclick={(e) => { e.preventDefault(); goto('/auth'); }}
					class="rounded-lg border-[3px] border-black bg-purple px-5 py-1.5 font-heading font-bold text-white shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000]"
				>
					Play Game
				</a>
				<a
					href="/auth"
					class="rounded-lg border-[3px] border-black bg-white px-5 py-1.5 font-heading font-bold text-black shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000]"
				>
					Login
				</a>
			{/if}
		</div>

		<!-- mobile menu toggle -->
		<button
			class="flex flex-col gap-1.5 p-1 md:hidden"
			onclick={() => (mobileOpen = !mobileOpen)}
			aria-label="Toggle menu"
		>
			<span class="block h-0.5 w-6 bg-black transition-all {mobileOpen ? 'translate-y-2 rotate-45' : ''}"></span>
			<span class="block h-0.5 w-6 bg-black transition-all {mobileOpen ? 'opacity-0' : ''}"></span>
			<span class="block h-0.5 w-6 bg-black transition-all {mobileOpen ? '-translate-y-2 -rotate-45' : ''}"></span>
		</button>
	</nav>

	<!-- mobile menu -->
	{#if mobileOpen}
		<div class="border-t-[4px] border-black bg-white px-4 pb-4 md:hidden">
			<div class="flex flex-col gap-4 pt-4">
				<a href="/" onclick={() => (mobileOpen = false)} class="font-heading font-semibold text-black">Home</a>
				<button onclick={scrollToBlog} class="text-left font-heading font-semibold text-black">Blog</button>
				<a href="/leaderboard" onclick={() => (mobileOpen = false)} class="font-heading font-semibold text-black">Leaderboard</a>

				{#if auth.isLoggedIn}
					<a
						href="/game"
						onclick={() => (mobileOpen = false)}
						class="w-full rounded-lg border-[3px] border-black bg-purple px-5 py-2 text-center font-heading font-bold text-white shadow-[3px_3px_0_0_#000]"
					>
						Play Game
					</a>
					<div class="flex items-center justify-between">
						<span class="font-heading text-sm font-semibold capitalize">{auth.user?.name}</span>
						<button onclick={handleLogout} class="font-heading text-sm font-semibold text-gray-500 underline">Logout</button>
					</div>
				{:else}
					<a
						href="/auth"
						onclick={() => (mobileOpen = false)}
						class="w-full rounded-lg border-[3px] border-black bg-purple px-5 py-2 text-center font-heading font-bold text-white shadow-[3px_3px_0_0_#000]"
					>
						Play Game
					</a>
					<a
						href="/auth"
						onclick={() => (mobileOpen = false)}
						class="w-full rounded-lg border-[3px] border-black bg-white px-5 py-2 text-center font-heading font-bold text-black shadow-[3px_3px_0_0_#000]"
					>
						Login
					</a>
				{/if}
			</div>
		</div>
	{/if}
</header>

{@render children()}
