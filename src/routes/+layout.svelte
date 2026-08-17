<script lang="ts">
	// Bootstrap primero, tokens propios después: el orden del cascade importa
	// y acá queda explícito en vez de escondido en un @import.
	import 'bootstrap/dist/css/bootstrap.min.css';
	import '../app.css';

	import { beforeNavigate } from '$app/navigation';
	import { page, updated } from '$app/state';

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
		PREVENCIÓN de la pantalla en blanco.

		Con `version.pollInterval` configurado, SvelteKit consulta en segundo
		plano si se publicó una versión nueva y marca `updated.current`. Cuando
		eso pasa, la próxima navegación se hace COMPLETA —recargando la página—
		en vez de por dentro.

		Así no se llega a pedir un archivo que ya no existe. Es el patrón que
		documenta SvelteKit para este caso exacto.
	*/
	beforeNavigate(({ willUnload, to }) => {
		if (updated.current && !willUnload && to?.url) {
			location.href = to.url.href;
		}
	});

	/*
		RECUPERACIÓN, por si la prevención no alcanzó.

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
	<!--
		El enlace al manifest va a mano: con `ssr: false` el plugin no lo inyecta,
		y sin él el navegador no detecta la app como instalable. Sin manifest no
		hay botón de instalar, ni el de Chrome ni el nuestro.
	-->
	<link rel="manifest" href="/manifest.webmanifest" />
	<meta name="theme-color" content="#8f4a22" />
	<link rel="apple-touch-icon" href="/icono-192.png" />
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
