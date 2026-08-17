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
-->
<script lang="ts">
	type Props = {
		/** `page.url.pathname`, provisto por el layout raíz. */
		rutaActual: string;
	};

	let { rutaActual }: Props = $props();

	const enlaces = [
		{ href: '/', texto: 'Buscador' },
		{ href: '/indice', texto: 'Índice' },
		{ href: '/fuentes', texto: 'Fuentes' }
	];
</script>

<nav class="vista__nav" aria-label="Principal">
	{#each enlaces as enlace (enlace.href)}
		{@const actual = rutaActual === enlace.href ? 'page' : undefined}
		<a class="vista__nav-enlace" href={enlace.href} aria-current={actual}>{enlace.texto}</a>
	{/each}
</nav>
