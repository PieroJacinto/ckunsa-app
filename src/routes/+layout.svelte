<script lang="ts">
	// Bootstrap primero, tokens propios después: el orden del cascade importa
	// y acá queda explícito en vez de escondido en un @import.
	import 'bootstrap/dist/css/bootstrap.min.css';
	import '../app.css';

	import { page } from '$app/state';

	import NavPrincipal from '$lib/componentes/NavPrincipal.svelte';
	import { proveerDiccionario } from '$lib/stores/contexto.svelte';
	import AvisoActualizacion from '$lib/componentes/AvisoActualizacion.svelte';

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
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<!--
	El nav vive acá y no en AppViewLayout porque `page` necesita el contexto de
	SvelteKit: poniéndolo en el layout raíz, AppViewLayout queda puro y testeable
	sin levantar la app.
-->
<AvisoActualizacion />
<div class="chrome">
	<NavPrincipal rutaActual={page.url.pathname} />
</div>

{@render children()}
