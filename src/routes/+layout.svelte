<script lang="ts">
	// Bootstrap primero, tokens propios después: el orden del cascade importa
	// y acá queda explícito en vez de escondido en un @import.
	import 'bootstrap/dist/css/bootstrap.min.css';
	import '../app.css';

	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}