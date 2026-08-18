<!--
	Navegación principal. Componente PURO: recibe la ruta como prop en vez de
	leer `$app/state`.

	Por qué importa: un componente que alcanza un global sólo se puede probar
	corriendo la app entera, porque `page` necesita el contexto de una petición
	de SvelteKit. Recibiéndola como prop, se testea en milisegundos y además
	respeta "vistas finas": recibe y renderiza, no va a buscar.

	Quien conoce la ruta es el layout raíz, que sí vive dentro de ese contexto.

	La página actual se marca con aria-current, que es lo que anuncia un lector
	de pantalla. El color solo no alcanza.

	CINCO secciones, no seis: en móvil esto es una barra de pestañas y cada ítem
	tiene unos 64 px. «La lengua» y «La escritura» comparten lugar y se reparten
	con pestañas dentro de la sección.
-->
<script lang="ts">
	type Props = {
		/** `page.url.pathname`, provisto por el layout raíz. */
		rutaActual: string;
	};

	let { rutaActual }: Props = $props();

	const enlaces = [
		{ href: '/', texto: 'Buscar' },
		{ href: '/indice', texto: 'Índice' },
		{ href: '/lengua', texto: 'El ckunsa' },
		{ href: '/proyecto', texto: 'Proyecto' },
		{ href: '/fuentes', texto: 'Fuentes' }
	];

	/*
		`trailingSlash: 'always'` hace que la URL real sea `/lengua/` con barra
		final, mientras que los `href` se escriben sin ella. Sin normalizar, la
		comparación nunca coincide y ninguna sección aparece marcada.

		Estuvo roto un buen rato sin que se notara: la home funcionaba, porque `/`
		coincide consigo misma, y era la única que se miraba.
	*/
	function normalizar(ruta: string): string {
		return ruta !== '/' && ruta.endsWith('/') ? ruta.slice(0, -1) : ruta;
	}
</script>

<nav class="vista__nav" aria-label="Principal">
	{#each enlaces as enlace (enlace.href)}
		{@const actual = normalizar(rutaActual) === enlace.href ? 'page' : undefined}
		<a class="vista__nav-enlace" href={enlace.href} aria-current={actual}>{enlace.texto}</a>
	{/each}
</nav>
