<script lang="ts">
	import { knotState } from '$lib/state.svelte';
	import { PRESETS } from '$lib/presets';
	import {
		Play,
		Pause,
		Settings,
		Grid,
		Sparkles,
		X,
		Image as ImageIcon,
		Share
	} from 'lucide-svelte';
	import { fade, fly, scale } from 'svelte/transition';

	// UI State
	// 'export' is a modal, others are stages
	let activeStage = $state<'presets' | 'customize' | 'background' | 'export' | null>(null);

	function toggleStage(stage: 'presets' | 'customize' | 'background' | 'export') {
		if (activeStage === stage) activeStage = null;
		else activeStage = stage;
	}

	function handleExport(format: 'obj' | 'stl') {
		document.dispatchEvent(new CustomEvent('export-request', { detail: format }));
		activeStage = null;
	}
</script>

<!-- TOP BAR (Only Logo) -->
<div
	class="pointer-events-none fixed top-0 left-0 z-50 flex w-full items-start justify-between p-6"
>
	<div class="pointer-events-auto">
		<h1
			class="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-2xl font-black tracking-tighter text-transparent drop-shadow-lg"
		>
			KNOTS<span class="ml-1 align-top font-mono text-[10px] text-white/50">FLOW</span>
		</h1>
	</div>
</div>

<!-- CENTRAL STAGE POPOVERS (Above Capsule) -->
{#if activeStage === 'presets'}
	<div
		transition:fly={{ y: 20, duration: 300 }}
		class="fixed bottom-28 left-1/2 z-40 w-full max-w-2xl -translate-x-1/2 px-4"
	>
		<div
			class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/80 px-4 py-4 shadow-2xl backdrop-blur-2xl"
		>
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold tracking-widest text-slate-400 uppercase">Select Preset</span
				>
				<button class="text-slate-500 hover:text-white" onclick={() => (activeStage = null)}
					><X size={14} /></button
				>
			</div>
			<!-- Horizontal Scroll Presets -->
			<div class="custom-scrollbar flex gap-2 overflow-x-auto pb-2">
				{#each Object.entries(PRESETS) as [key, preset]}
					<button
						class="min-w-[120px] shrink-0 rounded-lg border border-white/5 bg-white/5 p-3 text-left transition-all hover:border-purple-500/50 hover:bg-white/10 active:scale-95"
						onclick={() => knotState.setPreset(key)}
					>
						<div class="truncate font-mono text-[10px] text-slate-500 uppercase">{key}</div>
						<div class="truncate text-xs font-bold text-slate-200">{preset.name}</div>
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

{#if activeStage === 'customize'}
	<div
		transition:fly={{ y: 20, duration: 300 }}
		class="fixed bottom-28 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 px-4"
	>
		<div
			class="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/80 p-5 shadow-2xl backdrop-blur-2xl"
		>
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold tracking-widest text-slate-400 uppercase">Customize</span>
				<button class="text-slate-500 hover:text-white" onclick={() => (activeStage = null)}
					><X size={14} /></button
				>
			</div>

			<!-- Parameters -->
			<div class="grid grid-cols-1 gap-2">
				<div class="flex items-center rounded-lg border border-white/5 bg-white/5 px-2">
					<span class="mr-2 w-4 font-mono text-[10px] text-slate-500">X</span>
					<input
						type="text"
						bind:value={knotState.x}
						class="flex-1 border-none bg-transparent py-2 font-mono text-xs text-purple-300 focus:ring-0"
					/>
				</div>
				<div class="flex items-center rounded-lg border border-white/5 bg-white/5 px-2">
					<span class="mr-2 w-4 font-mono text-[10px] text-slate-500">Y</span>
					<input
						type="text"
						bind:value={knotState.y}
						class="flex-1 border-none bg-transparent py-2 font-mono text-xs text-purple-300 focus:ring-0"
					/>
				</div>
				<div class="flex items-center rounded-lg border border-white/5 bg-white/5 px-2">
					<span class="mr-2 w-4 font-mono text-[10px] text-slate-500">Z</span>
					<input
						type="text"
						bind:value={knotState.z}
						class="flex-1 border-none bg-transparent py-2 font-mono text-xs text-purple-300 focus:ring-0"
					/>
				</div>
			</div>

			<!-- Materials -->
			<div class="space-y-2">
				<span class="text-[10px] text-slate-400">Material</span>
				<div class="flex gap-1">
					{#each ['neon', 'chrome', 'liquid', 'iridescent'] as m}
						<button
							class={`flex-1 rounded-lg border py-2 text-[10px] font-bold uppercase transition-all ${knotState.materialMode === m ? 'border-white bg-white text-black' : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10'}`}
							onclick={() => (knotState.materialMode = m as any)}
						>
							{m.slice(0, 3)}
						</button>
					{/each}
				</div>
				<label
					class="flex cursor-pointer items-center gap-2 text-[10px] text-slate-300 select-none hover:text-white"
				>
					<input
						type="checkbox"
						bind:checked={knotState.useGradient}
						class="rounded border-white/20 bg-white/5 text-purple-500 focus:ring-0"
					/> Gradient color
				</label>
			</div>

			<!-- Sliders -->
			<div class="flex items-center gap-4">
				<div class="flex-1 space-y-1">
					<span class="text-[10px] text-slate-400">Thickness</span>
					<input
						type="range"
						min="0.1"
						max="2"
						step="0.1"
						bind:value={knotState.thickness}
						class="slider-sm w-full"
					/>
				</div>
				<div class="flex-1 space-y-1">
					<span class="text-[10px] text-slate-400">Color</span>
					<div class="flex items-center gap-2">
						<input
							type="color"
							bind:value={knotState.color}
							class="h-6 w-full cursor-pointer rounded border-none bg-transparent p-0"
						/>
					</div>
				</div>
			</div>

			<!-- Toggles -->
			<div class="flex gap-4">
				<label
					class="flex cursor-pointer items-center gap-2 text-[10px] text-slate-300 select-none hover:text-white"
				>
					<input
						type="checkbox"
						bind:checked={knotState.autoRotate}
						class="rounded border-white/20 bg-white/5 text-purple-500 focus:ring-0"
					/> Auto-Rotate
				</label>
				<label
					class="flex cursor-pointer items-center gap-2 text-[10px] text-slate-300 select-none hover:text-white"
				>
					<input
						type="checkbox"
						bind:checked={knotState.showLabels}
						class="rounded border-white/20 bg-white/5 text-purple-500 focus:ring-0"
					/> Labels
				</label>
			</div>
		</div>
	</div>
{/if}

{#if activeStage === 'background'}
	<div
		transition:fly={{ y: 20, duration: 300 }}
		class="fixed bottom-28 left-1/2 z-40 w-full max-w-sm -translate-x-1/2 px-4"
	>
		<div
			class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/80 p-4 text-center shadow-2xl backdrop-blur-2xl"
		>
			<span class="mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase"
				>Environment</span
			>
			<div class="flex justify-center gap-2">
				<button
					class={`flex-1 rounded-xl border py-3 text-xs font-bold transition-all ${knotState.bgStyle === 'void' ? 'border-white bg-white text-black' : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'}`}
					onclick={() => (knotState.bgStyle = 'void')}
				>
					Deep Void
				</button>
				<button
					class={`flex-1 rounded-xl border py-3 text-xs font-bold transition-all ${knotState.bgStyle === 'stars' ? 'border-white bg-white text-black' : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'}`}
					onclick={() => (knotState.bgStyle = 'stars')}
				>
					Starfield
				</button>
			</div>
		</div>
	</div>
{/if}

{#if activeStage === 'export'}
	<div
		transition:fly={{ y: 20, duration: 300 }}
		class="fixed bottom-28 left-1/2 z-40 w-full max-w-xs -translate-x-1/2 px-4"
	>
		<div
			class="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/80 p-2 shadow-2xl backdrop-blur-2xl"
		>
			<button
				class="w-full rounded-lg px-3 py-3 text-center text-sm font-bold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
				onclick={() => handleExport('obj')}>Download OBJ</button
			>
			<button
				class="w-full rounded-lg px-3 py-3 text-center text-sm font-bold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
				onclick={() => handleExport('stl')}>Download STL</button
			>
		</div>
	</div>
{/if}

<!-- BOTTOM CAPSULE BAR -->
<div class="fixed bottom-8 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 px-6">
	<div
		class="group relative flex items-center justify-between overflow-hidden rounded-full border border-white/10 bg-black/60 p-2 pr-3 pl-3 shadow-2xl backdrop-blur-2xl"
	>
		<!-- Actions Left -->
		<div class="flex items-center gap-2">
			<!-- Preset Toggle -->
			<button
				class={`rounded-full p-3 transition-all hover:bg-white/10 hover:text-white active:scale-95 ${activeStage === 'presets' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:bg-white hover:text-black' : 'text-slate-400'}`}
				onclick={() => toggleStage('presets')}
				title="Presets"
			>
				<Grid size={20} />
			</button>

			<!-- Customize Toggle -->
			<button
				class={`rounded-full p-3 transition-all hover:bg-white/10 hover:text-white active:scale-95 ${activeStage === 'customize' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:bg-white hover:text-black' : 'text-slate-400'}`}
				onclick={() => toggleStage('customize')}
				title="Customize"
			>
				<Settings size={20} />
			</button>

			<!-- Background Toggle -->
			<button
				class={`rounded-full p-3 transition-all hover:bg-white/10 hover:text-white active:scale-95 ${activeStage === 'background' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:bg-white hover:text-black' : 'text-slate-400'}`}
				onclick={() => toggleStage('background')}
				title="Background"
			>
				<ImageIcon size={20} />
			</button>
			<div class="mx-1 h-8 w-px bg-white/10"></div>
		</div>

		<!-- Center: Interactive Playback -->
		<div class="flex flex-1 items-center justify-center gap-4 px-2">
			<button
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-300 hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] active:scale-90"
				onclick={() => knotState.togglePlay()}
			>
				{#if knotState.isPlaying}
					<Pause size={18} fill="currentColor" />
				{:else}
					<Play size={18} fill="currentColor" class="translate-x-0.5" />
				{/if}
			</button>

			<!-- Interactive Slider -->
			<div class="group/slider relative flex-1">
				<input
					type="range"
					min="0"
					max="1"
					step="0.01"
					bind:value={knotState.growth}
					onmousedown={() => {
						if (knotState.isPlaying) knotState.togglePlay();
					}}
					class="slider-track absolute inset-0 z-10 w-full cursor-pointer opacity-0"
				/>
				<!-- Visual Track -->
				<div
					class="pointer-events-none relative h-1.5 w-full overflow-hidden rounded-full bg-white/10 transition-all group-hover/slider:h-2"
				>
					<div
						class="absolute inset-y-0 left-0 bg-white shadow-[0_0_10px_white] transition-all duration-75"
						style={`width: ${knotState.growth * 100}%`}
					></div>
				</div>
				<!-- Thumb Hint (visible on interaction) -->
				<div
					class="pointer-events-none absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover/slider:opacity-100"
					style={`left: ${knotState.growth * 100}%; transform: translate(-50%, -50%)`}
				></div>
			</div>
		</div>

		<!-- Right: Export -->
		<div class="flex items-center gap-2 pl-2">
			<div class="mx-1 h-8 w-px bg-white/10"></div>
			<button
				class={`rounded-full p-3 text-slate-400 transition-all hover:bg-white/10 hover:text-white active:scale-95 ${activeStage === 'export' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''}`}
				onclick={() => toggleStage('export')}
			>
				<Share size={20} />
			</button>
		</div>
	</div>
</div>

<style>
	/* SCROLLBAR & SLIDERS */
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
		height: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.slider-sm {
		height: 4px;
		appearance: none;
		border-radius: 9999px;
		background-color: #334155;
	}
	.slider-sm::-webkit-slider-thumb {
		height: 10px;
		width: 10px;
		appearance: none;
		border-radius: 9999px;
		background-color: white;
		transition: transform 0.2s;
	}
	.slider-sm::-webkit-slider-thumb:hover {
		transform: scale(1.2);
	}
</style>
