<script lang="ts">
	import { T } from '@threlte/core';
	import { Text, MeshRefractionMaterial, LinearGradientTexture } from '@threlte/extras';
	import * as THREE from 'three';
	import { generateKnotPoints } from '$lib/math';
	import { knotState } from '$lib/state.svelte';
	import { exportKnot } from '$lib/export';
	import { onDestroy, onMount } from 'svelte';

	// Reactively generate points
	let fullPoints = $derived(generateKnotPoints(knotState.x, knotState.y, knotState.z, 300));

	// Slice points based on growth
	let visiblePoints = $derived.by(() => {
		if (fullPoints.length < 2) return [];
		const count = Math.max(2, Math.floor(fullPoints.length * knotState.growth));
		return fullPoints.slice(0, count);
	});

	// Create curve
	let curve = $derived.by(() => {
		if (visiblePoints.length < 2) return null;
		return new THREE.CatmullRomCurve3(visiblePoints, true); // closed=true for full loops if complete
	});

	// Geometry args - Higher resolution
	// args: [curve, tubularSegments, radius, radialSegments, closed]
	let geometryArgs = $derived(curve ? [curve, 256, knotState.thickness, 32, false] : null);

	let meshRef = $state<THREE.Mesh>();

	// Export Listener
	function handleExport(e: CustomEvent<string>) {
		if (meshRef) exportKnot(meshRef, e.detail as 'obj' | 'stl', 'knot');
	}

	onMount(() => {
		document.addEventListener('export-request', handleExport as any);
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.removeEventListener('export-request', handleExport as any);
		}
	});
</script>

{#if geometryArgs}
	<T.Mesh bind:ref={meshRef}>
		<T.TubeGeometry args={geometryArgs} />

		<!-- Gradient Texture (Slot for map/emissiveMap) -->
		{#snippet gradient()}
			<LinearGradientTexture
				stops={[
					{ offset: 0, color: knotState.color },
					{ offset: 0.5, color: '#ffffff' },
					{ offset: 1, color: knotState.color }
				]}
			/>
		{/snippet}

		<!-- MATERIAL SWITCHING -->
		{#if knotState.materialMode === 'neon'}
			<T.MeshPhysicalMaterial
				color={knotState.color}
				roughness={0.2}
				metalness={0.1}
				clearcoat={1}
				clearcoatRoughness={0.1}
				transmission={0.2}
				emissive={knotState.color}
				emissiveIntensity={0.5}
			>
				{#if knotState.useGradient}
					<T.Slot slot="emissiveMap">{@render gradient()}</T.Slot>
				{/if}
			</T.MeshPhysicalMaterial>
		{:else if knotState.materialMode === 'chrome'}
			<T.MeshStandardMaterial
				color={knotState.useGradient ? '#ffffff' : knotState.color}
				roughness={0}
				metalness={1}
				envMapIntensity={1}
			>
				{#if knotState.useGradient}
					<T.Slot slot="map">{@render gradient()}</T.Slot>
				{/if}
			</T.MeshStandardMaterial>
		{:else if knotState.materialMode === 'liquid'}
			<MeshRefractionMaterial
				color={knotState.color}
				ior={1.4}
				reflectivity={0.5}
				transmission={1}
				roughness={0}
				aberrationStrength={0.01}
				toneMapped={false}
			/>
			<!-- Note: Gradient doesn't really apply well to Refraction material -->
		{:else if knotState.materialMode === 'iridescent'}
			<T.MeshPhysicalMaterial
				color={knotState.color}
				roughness={0.1}
				metalness={0.1}
				transmission={0.5}
				thickness={2}
				iridescence={1}
				iridescenceIOR={1.3}
				iridescenceThicknessRange={[100, 400]}
			>
				{#if knotState.useGradient}
					<T.Slot slot="map">{@render gradient()}</T.Slot>
				{/if}
			</T.MeshPhysicalMaterial>
		{/if}

		{#if knotState.showLabels}
			<Text
				text={knotState.x + '\n' + knotState.y + '\n' + knotState.z}
				position={[0, 4, 0]}
				fontSize={0.5}
				color="white"
				anchorX="center"
				anchorY="middle"
				outlineWidth={0.05}
				outlineColor="#000000"
			/>
		{/if}
	</T.Mesh>
{/if}
