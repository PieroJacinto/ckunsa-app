<!--
	Layout obligatorio de toda página (`01-ARQUITECTURA` §5).

	Nadie arma header ni título a mano. Si cada página se maquetea sola, en tres
	meses hay tres versiones distintas del encabezado y ninguna es la correcta.

	Además garantiza dos cosas que no pueden faltar en ninguna pantalla: el
	enlace de salto al contenido (accesibilidad por teclado) y la línea que dice
	a quién pertenece la lengua (`05-PROTOCOLO` §6).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		titulo: string;
		subtitulo?: string;
		/** Contenido opcional del encabezado, a la derecha del título. */
		acciones?: Snippet;
		children: Snippet;
	};

	let { titulo, subtitulo, acciones, children }: Props = $props();
</script>

<svelte:head>
	<title>{titulo} · Diccionario ckunsa</title>
</svelte:head>

<!--
	Primero en el DOM y visible sólo al navegar con teclado: sin esto, quien usa
	teclado o lector de pantalla atraviesa el encabezado en cada página.
-->
<a class="vista__salto" href="#contenido">Saltar al contenido</a>

<div class="vista">
	<header class="vista__encabezado">
		<div class="vista__titulos">
			<h1 class="vista__titulo">{titulo}</h1>
			{#if subtitulo}
				<p class="vista__subtitulo">{subtitulo}</p>
			{/if}
		</div>

		{#if acciones}
			<div class="vista__acciones">{@render acciones()}</div>
		{/if}
	</header>

	<main class="vista__contenido" id="contenido">
		{@render children()}
	</main>

	<footer class="vista__pie">
		<p>
			El ckunsa es patrimonio del pueblo lickanantay.
			<a href="/fuentes">Fuentes y créditos</a>
		</p>
	</footer>
</div>
