<script lang="ts">
	import { Canvas } from '@threlte/core';
	import { T } from '@threlte/core';
	import { OrbitControls, Stars, Environment } from '@threlte/extras';
	import Knot from './Knot.svelte';
	import { knotState } from '$lib/state.svelte';
</script>

<div class="h-full w-full bg-slate-900">
	<Canvas>
		<T.PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50}>
			<OrbitControls enableDamping autoRotate={knotState.autoRotate} autoRotateSpeed={2.0} />
		</T.PerspectiveCamera>

		<T.AmbientLight intensity={0.5} />
		<T.DirectionalLight position={[10, 10, 5]} intensity={1.5} color="white" />
		<T.PointLight position={[-10, -10, -5]} intensity={1} color="#4400ff" />

		{#if knotState.bgStyle === 'stars'}
			<Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
		{/if}
		<Environment preset="city" />

		<Knot />
	</Canvas>
</div>
