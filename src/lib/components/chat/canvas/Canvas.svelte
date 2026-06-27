<script lang="ts">
	import { onMount } from 'svelte';
	import { showCanvas, canvasElements } from '$lib/stores';
	import { CanvasController } from './CanvasController';
	import { CanvasEngine } from './CanvasEngine';

	const controller = new CanvasController();
	let canvasElement: HTMLCanvasElement;
	let containerElement: HTMLDivElement;

	// Keep controller in sync with store elements reactively
	$: {
		controller.syncStore($canvasElements);
	}

	function handleResize() {
		if (canvasElement && containerElement) {
			const rect = containerElement.getBoundingClientRect();
			// Subtract header height (approx 60px) and padding
			const width = Math.max(rect.width - 32, 100); 
			const height = Math.max(rect.height - 80, 100); 
			
			const dpr = window.devicePixelRatio || 1;
			canvasElement.width = width * dpr;
			canvasElement.height = height * dpr;
			canvasElement.style.width = `${width}px`;
			canvasElement.style.height = `${height}px`;
			
			const ctx = canvasElement.getContext('2d');
			if (ctx) {
				ctx.resetTransform();
				ctx.scale(dpr, dpr);
			}
			
			const engine = new CanvasEngine(canvasElement);
			controller.setEngine(engine);
		}
	}

	onMount(() => {
		handleResize();
		window.addEventListener('resize', handleResize);

		// Observe container resizing for smooth layout changes when splitting
		const resizeObserver = new ResizeObserver(() => {
			handleResize();
		});
		if (containerElement) {
			resizeObserver.observe(containerElement);
		}

		return () => {
			window.removeEventListener('resize', handleResize);
			resizeObserver.disconnect();
		};
	});
</script>

<div 
	bind:this={containerElement} 
	class="h-full w-full flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-4"
>
	<!-- Panel Header -->
	<div class="flex items-center justify-between pb-4 shrink-0 border-b border-gray-100 dark:border-gray-850">
		<h2 class="text-lg font-semibold text-gray-900 dark:text-white">AI Drawing Canvas</h2>
		<button
			class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition"
			on:click={() => showCanvas.set(false)}
			aria-label="Close canvas"
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
	
	<!-- Panel Body -->
	<div class="flex-1 flex flex-col items-center justify-center relative mt-4">
		<canvas 
			bind:this={canvasElement} 
			class="bg-gray-50 dark:bg-gray-950 rounded border border-gray-100 dark:border-gray-800"
		/>
	</div>
</div>
