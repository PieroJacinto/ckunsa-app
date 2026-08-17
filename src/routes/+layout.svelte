<script lang="ts">
	// Bootstrap primero, tokens propios después: el orden del cascade importa
	// y acá queda explícito en vez de escondido en un @import.
	import 'bootstrap/dist/css/bootstrap.min.css';
	import '../app.css';

	import { page } from '$app/state';

	import AvisoActualizacion from '$lib/componentes/AvisoActualizacion.svelte';
	import NavPrincipal from '$lib/componentes/NavPrincipal.svelte';
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

	/*
		Chunk viejo que ya no existe: pantalla en blanco.

		Cada build genera nombres de archivo con hash nuevo y Cloudflare borra
		los anteriores. Además el service worker limpia su caché anterior al
		activarse. Si una pestaña quedó abierta con la versión vieja —o si el
		usuario vuelve atrás a una página restaurada de la caché del navegador—,
		al navegar pide un chunk que ya no está en ningún lado. El servidor
		responde con el 200.html de fallback, el navegador lo rechaza porque no
		es JavaScript, y la app muere en blanco.

		Vite avisa de esto con `vite:preloadError`. Recargar lo resuelve, porque
		trae el HTML nuevo con los nombres de archivo nuevos.

		El guardia de sessionStorage evita un bucle: si recargar no arregla el
		problema, mejor una pantalla rota que un navegador recargando para
		siempre.
	*/
	$effect(() => {
		const alFallarChunk = (evento: Event) => {
			evento.preventDefault();

			const ultima = Number(sessionStorage.getItem('ck:recarga') ?? 0);
			if (Date.now() - ultima < 10_000) return;

			sessionStorage.setItem('ck:recarga', String(Date.now()));
			location.reload();
		};

		window.addEventListener('vite:preloadError', alFallarChunk);
		return () => window.removeEventListener('vite:preloadError', alFallarChunk);
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<AvisoActualizacion />

<!--
	El nav vive acá y no en AppViewLayout porque `page` necesita el contexto de
	SvelteKit: poniéndolo en el layout raíz, AppViewLayout queda puro y testeable
	sin levantar la app.
-->
<div class="chrome">
	<NavPrincipal rutaActual={page.url.pathname} />
</div>

{@render children()}
