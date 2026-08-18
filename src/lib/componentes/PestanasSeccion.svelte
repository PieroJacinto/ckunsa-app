<!--
	Pestañas dentro de una sección.

	«La lengua» y «La escritura» son dos objetos distintos —el sistema y su
	representación escrita, que acá además es una decisión política de la
	comunidad— pero comparten objeto de estudio. Por eso ocupan un solo lugar en
	la navegación principal y se reparten con pestañas acá adentro.

	POR QUÉ ASÍ Y NO UN MENÚ QUE SE DESPLIEGA: esconder navegación corta la
	descubribilidad casi a la mitad. Con pestañas las dos opciones están siempre
	visibles, y es el mismo patrón que ya usa el índice con «Alfabético» y «Por
	tema» — el usuario no aprende un concepto nuevo.

	Son ENLACES, no botones: cada sección tiene su propia URL, se puede compartir
	y funciona el botón atrás.
-->
<script lang="ts">
	type Pestana = { href: string; texto: string };

	type Props = {
		pestanas: Pestana[];
		/** `page.url.pathname`, provisto por la página. */
		rutaActual: string;
		/** Etiqueta accesible: distingue esta navegación de la principal. */
		etiqueta: string;
	};

	let { pestanas, rutaActual, etiqueta }: Props = $props();

	/*
		Mismo motivo que en NavPrincipal: con `trailingSlash: 'always'` la ruta
		real lleva barra final y los `href` no, así que sin normalizar ninguna
		pestaña queda marcada.
	*/
	function normalizar(ruta: string): string {
		return ruta !== '/' && ruta.endsWith('/') ? ruta.slice(0, -1) : ruta;
	}
</script>

<nav class="pestanas" aria-label={etiqueta}>
	{#each pestanas as pestana (pestana.href)}
		{@const actual = normalizar(rutaActual) === pestana.href ? 'page' : undefined}
		<a class="pestanas__enlace" href={pestana.href} aria-current={actual}>{pestana.texto}</a>
	{/each}
</nav>
