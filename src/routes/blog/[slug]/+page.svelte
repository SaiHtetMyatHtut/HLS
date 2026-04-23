<script lang="ts">
	import { page } from '$app/state';
	import { getPost } from '$lib/blog-data';
	import { goto } from '$app/navigation';

	let post = $derived(page.params.slug ? getPost(page.params.slug) : undefined);
</script>

<svelte:head>
	<title>{post ? post.title + ' — HealthyPick Blog' : 'Post Not Found'}</title>
</svelte:head>

<div class="min-h-[calc(100vh-68px)] bg-[#f9faf5] font-body">
	{#if !post}
		<div class="flex min-h-[calc(100vh-68px)] flex-col items-center justify-center gap-4 px-4">
			<p class="text-6xl">🤔</p>
			<h1 class="font-heading text-3xl font-extrabold">Post not found</h1>
			<a href="/#blog" class="font-heading font-bold text-purple underline underline-offset-2">
				← Back to Blog
			</a>
		</div>
	{:else}
		<article class="mx-auto max-w-2xl px-4 pb-20 pt-12">
			<!-- back link -->
			<a
				href="/#blog"
				class="mb-8 inline-flex items-center gap-2 font-heading text-sm font-bold text-gray-500 no-underline transition-colors hover:text-black"
			>
				← Back to Blog
			</a>

			<!-- cover emoji card -->
			<div class="relative mb-8">
				<div
					class="absolute -bottom-2 -right-2 h-full w-full rounded-2xl border-[4px] border-black {post.accentColor} opacity-70"
				></div>
				<div
					class="relative flex h-40 items-center justify-center rounded-2xl border-[4px] border-black bg-white text-7xl"
				>
					{post.coverEmoji}
				</div>
			</div>

			<!-- meta -->
			<div class="mb-4 flex flex-wrap items-center gap-3">
				<span
					class="rounded-full border-[3px] border-black bg-yellow px-3 py-0.5 font-heading text-sm font-bold"
				>
					{post.category}
				</span>
				<span class="text-sm text-gray-400">{post.date}</span>
				<span class="text-sm text-gray-400">·</span>
				<span class="text-sm text-gray-400">{post.readTime}</span>
			</div>

			<!-- title -->
			<h1 class="font-heading text-3xl font-extrabold leading-tight text-black sm:text-4xl">
				{post.title}
			</h1>

			<!-- excerpt / lead -->
			<p class="mt-4 border-l-[4px] border-teal pl-4 text-lg font-semibold text-gray-600 italic">
				{post.excerpt}
			</p>

			<!-- content -->
			<div class="mt-8 flex flex-col gap-5 text-gray-700 leading-relaxed">
				{#each post.content as paragraph}
					{@const isBold = paragraph.startsWith('**')}
					{#if isBold}
						<!-- Format "**Title** rest of text" as a headed paragraph -->
						{@const [, boldPart, rest] = paragraph.match(/^\*\*(.+?)\*\*(.*)$/) ?? []}
						<p>
							<strong class="font-heading font-bold text-black">{boldPart}</strong>{rest}
						</p>
					{:else}
						<p>{paragraph}</p>
					{/if}
				{/each}
			</div>

			<!-- divider -->
			<hr class="my-10 border-[2px] border-black" />

			<!-- CTA -->
			<div class="relative">
				<div class="absolute -bottom-2 -right-2 h-full w-full rounded-xl border-[4px] border-black bg-purple opacity-70"></div>
				<div class="relative rounded-xl border-[4px] border-black bg-white p-6 text-center">
					<p class="font-heading text-lg font-bold">Ready to put your knowledge to the test?</p>
					<p class="mt-1 text-sm text-gray-500">Play HealthyPick and see how well you know your nutrition.</p>
					<a
						href="/game"
						class="mt-4 inline-block rounded-lg border-[3px] border-black bg-purple px-8 py-2.5 font-heading font-bold text-white shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000]"
					>
						▶ Play Now
					</a>
				</div>
			</div>

			<!-- back -->
			<div class="mt-10 text-center">
				<a href="/#blog" class="font-heading font-bold text-gray-500 underline underline-offset-2 hover:text-black">
					← More articles
				</a>
			</div>
		</article>
	{/if}
</div>
