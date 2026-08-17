<!--
	Lo que ve alguien que entra por primera vez.

	Sólo aparece con el buscador vacío: apenas se escribe algo, desaparece y
	quedan los resultados. Una ayuda que no se va se vuelve estorbo.

	Los ejemplos son tocables y no decorativos: alguien que toca "cueva" y ve
	dos fichas entiende en un segundo algo que un párrafo no explica igual de
	bien. Los tres están elegidos para mostrar una cosa distinta cada uno.
-->
<script lang="ts">
	import { DESCRIPCION_NIVEL } from '$lib/domain/evidencia';
	import type { NivelEvidencia } from '$lib/domain/tipos';

	import EvidenceBadge from './EvidenceBadge.svelte';

	type Props = {
		/** Llena el buscador con la palabra del ejemplo. */
		onEjemplo: (palabra: string) => void;
	};

	let { onEjemplo }: Props = $props();

	const NIVELES: NivelEvidencia[] = ['atestiguada', 'unificada', 'reconstruida', 'propuesta'];

	const EJEMPLOS = [
		{ palabra: 'cueva', porque: 'dos palabras distintas para un mismo concepto' },
		{ palabra: 'luna', porque: 'una palabra con dos significados' },
		{ palabra: 'cabur', porque: 'una grafía antigua que igual encuentra' }
	];
</script>

<section class="bienvenida">
	<p class="bienvenida__intro">
		Diccionario de la lengua <strong>ckunsa</strong>, del pueblo lickanantay del Salar de Atacama.
		Es una lengua dormida: hace más de un siglo que no se registran hablantes fluidos, y casi todo
		lo que sabemos viene de anotaciones hechas por gente de afuera. Por eso
		<strong>cada palabra dice de dónde sale</strong>.
	</p>

	<h2 class="bienvenida__titulo">Probá con</h2>

	<div class="bienvenida__ejemplos">
		{#each EJEMPLOS as ejemplo (ejemplo.palabra)}
			<button type="button" class="bienvenida__ejemplo" onclick={() => onEjemplo(ejemplo.palabra)}>
				<span class="bienvenida__palabra">{ejemplo.palabra}</span>
				<span class="bienvenida__porque">{ejemplo.porque}</span>
			</button>
		{/each}
	</div>

	<h2 class="bienvenida__titulo">Qué significan las marcas</h2>

	<dl class="bienvenida__niveles">
		{#each NIVELES as nivel (nivel)}
			<dt><EvidenceBadge {nivel} /></dt>
			<dd>{DESCRIPCION_NIVEL[nivel]}</dd>
		{/each}
	</dl>

	<p class="bienvenida__mas">
		<a href="/fuentes">De dónde salen estas palabras</a>
	</p>
</section>
