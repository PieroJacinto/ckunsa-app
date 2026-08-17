<!--
	Índice del diccionario: recorrer el léxico sin buscar.

	SE MUESTRA UNA LETRA (O UN TEMA) POR VEZ, a propósito. Volcar las 24
	secciones juntas genera 12.232 elementos DOM —medido—, muy por encima de lo
	razonable para un teléfono barato, y obliga al usuario a scrollear de vuelta
	arriba para cambiar de letra. Con una sección por vez el DOM baja a unos
	cientos y la barra de letras queda siempre a la vista.

	La letra y el tema viajan en la URL para que un enlace se pueda compartir y
	sobreviva a una recarga. Se usa `replaceState` y no `pushState`: cambiar de
	letra no debería llenar el historial y obligar a apretar "atrás" diez veces
	para salir de la página.

	El orden alfabético es por la GLOSA EN ESPAÑOL, no por la forma ckunsa. El
	porqué está en `domain/indice.ts`.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import AppViewLayout from '$lib/componentes/AppViewLayout.svelte';
	import EvidenceBadge from '$lib/componentes/EvidenceBadge.svelte';
	import { agruparPorCampoSemantico, construirIndiceAlfabetico } from '$lib/domain/indice';
	import { usarDiccionario } from '$lib/stores/contexto.svelte';

	const diccionario = usarDiccionario();

	const corpus = $derived(
		diccionario.estado === 'listo'
			? { version: 1, entradas: diccionario.todas(), fuentes: [], morfemas: [] }
			: null
	);

	const alfabetico = $derived(corpus ? construirIndiceAlfabetico(corpus) : []);
	const semantico = $derived(corpus ? agruparPorCampoSemantico(corpus) : []);

	const porTema = $derived(page.url.searchParams.get('vista') === 'temas');

	const letraActiva = $derived(page.url.searchParams.get('letra') ?? alfabetico[0]?.letra ?? '');
	const temaActivo = $derived(page.url.searchParams.get('tema') ?? semantico[0]?.campo ?? '');

	const grupoLetra = $derived(alfabetico.find((g) => g.letra === letraActiva));
	const grupoTema = $derived(semantico.find((g) => g.campo === temaActivo));

	/*
		`goto` y no `replaceState`: replaceState es shallow routing —asocia estado
		con una entrada del historial SIN navegar—, así que cambia la barra de
		direcciones pero no actualiza `page.url` y nada se recalcula.

		`replaceState: true` evita llenar el historial: cambiar de letra no debería
		obligar a apretar "atrás" diez veces para salir de la página.
		`noScroll` mantiene la posición y `keepFocus` deja el foco en el botón que
		se acaba de tocar, que si no se pierde al navegar.

		Se copia la URL con `new URL(...)` en vez de mutar `page.url`: mutarla es
		la causa del bug conocido de "page.url no es reactivo".
	*/
	function ir(params: Record<string, string>) {
		const url = new URL(page.url);
		for (const [clave, valor] of Object.entries(params)) url.searchParams.set(clave, valor);

		void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
	}
</script>

<AppViewLayout
	titulo="Índice"
	subtitulo={diccionario.estado === 'listo' ? `${diccionario.total} palabras` : undefined}
>
	{#if diccionario.estado !== 'listo'}
		<p class="estado">Cargando el diccionario…</p>
	{:else}
		<div class="indice__vistas" role="group" aria-label="Cómo ordenar el índice">
			<button
				type="button"
				class="indice__vista"
				aria-pressed={!porTema}
				onclick={() => ir({ vista: 'letras' })}>Alfabético</button
			>
			<button
				type="button"
				class="indice__vista"
				aria-pressed={porTema}
				onclick={() => ir({ vista: 'temas' })}>Por tema</button
			>
		</div>

		{#if !porTema}
			<p class="indice__nota">
				Ordenado por el significado en español, igual que el glosario del Consejo Lingüístico
				Ckunsa. El orden alfabético del ckunsa lo define el Grafemario Unificado, que este proyecto
				todavía no pudo consultar: <code>ck</code>, <code>tch</code> y
				<code>tt</code> son letras propias y no sabemos en qué posición van.
				<a href="/grafia">Más sobre la escritura</a>.
			</p>

			<!-- Pegada arriba: cambiar de letra no puede exigir volver a scrollear. -->
			<nav class="indice__letras" aria-label="Elegir letra">
				{#each alfabetico as grupo (grupo.letra)}
					{@const activa = grupo.letra === letraActiva}
					<button
						type="button"
						class="indice__letra-boton"
						aria-pressed={activa}
						translate="no"
						onclick={() => ir({ letra: grupo.letra })}>{grupo.letra}</button
					>
				{/each}
			</nav>

			{#if grupoLetra}
				<h2 class="indice__titulo">
					{grupoLetra.letra} <small>({grupoLetra.lineas.length} significados)</small>
				</h2>

				<ul class="indice__lista">
					{#each grupoLetra.lineas as linea (linea.glosa + linea.entrada.id)}
						<li class="indice__linea">
							<span class="indice__glosa">{linea.glosa}</span>
							<a class="indice__forma" href="/palabra/{linea.entrada.id}">
								<EvidenceBadge nivel={linea.entrada.nivel_evidencia}>
									{linea.entrada.forma_clck}
								</EvidenceBadge>
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		{:else}
			<p class="indice__nota">
				Los temas son los 22 capítulos del cuestionario del Intercontinental Dictionary Series,
				adaptados de Buck (1949). No son las categorías del Consejo Lingüístico Ckunsa, que tiene
				las suyas propias.
			</p>

			<!-- Select y no 22 botones: con esa cantidad, una lista desplegable es
			     más rápida de recorrer y ocupa una línea en un teléfono. -->
			<label class="indice__selector">
				<span>Tema</span>
				<select value={temaActivo} onchange={(e) => ir({ tema: e.currentTarget.value })}>
					{#each semantico as grupo (grupo.campo)}
						<option value={grupo.campo}>{grupo.campo} ({grupo.entradas.length})</option>
					{/each}
				</select>
			</label>

			{#if grupoTema}
				<h2 class="indice__titulo">
					{grupoTema.campo} <small>({grupoTema.entradas.length} palabras)</small>
				</h2>

				<ul class="indice__lista">
					{#each grupoTema.entradas as entrada (entrada.id)}
						<li class="indice__linea">
							<a class="indice__forma" href="/palabra/{entrada.id}">
								<EvidenceBadge nivel={entrada.nivel_evidencia}>
									{entrada.forma_clck}
								</EvidenceBadge>
							</a>
							<span class="indice__glosa">{entrada.significados.join(', ')}</span>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	{/if}
</AppViewLayout>
