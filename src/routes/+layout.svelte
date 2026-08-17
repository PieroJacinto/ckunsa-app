<script lang="ts">
	// Bootstrap primero, tokens propios después: el orden del cascade importa
	// y acá queda explícito en vez de escondido en un @import.
	import 'bootstrap/dist/css/bootstrap.min.css';
	import '../app.css';

	import favicon from '$lib/assets/favicon.svg';
	import { proveerDiccionario } from '$lib/stores/contexto.svelte';

	let { children } = $props();

	// Una instancia por árbol de componentes, no una global de módulo.
	const diccionario = proveerDiccionario();

	// La carga arranca sólo en el navegador: en el servidor no hay a qué URL
	// pedirle los JSON, y además la app es offline-first — los datos los sirve
	// el service worker desde la caché.
	$effect(() => {
		if (diccionario.estado === 'inicial') {
			void diccionario.cargar({ fetch: window.fetch.bind(window) });
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
