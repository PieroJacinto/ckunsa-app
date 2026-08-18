<!--
	Ficha de palabra. Es donde el usuario se detiene a leer, así que acá va TODO
	el detalle: la nota de grafía completa por entrada (V4.1) y la cita
	bibliográfica entera, no la compacta.

	No hay `+page.ts` con `load`: los datos ya están en memoria y buscarlos es un
	lookup en un Map (0,25 µs). Un `load` tendría que volver a bajar el JSON o
	alcanzar el store desde fuera del árbol de componentes, donde el contexto no
	existe. En esta app no hay carga por ruta: hay un corpus que se descarga una
	vez y vive en memoria.
-->
<script lang="ts">
	import { page } from '$app/state';

	import AppViewLayout from '$lib/componentes/AppViewLayout.svelte';
	import CitaFuente from '$lib/componentes/CitaFuente.svelte';
	import EvidenceBadge from '$lib/componentes/EvidenceBadge.svelte';
	import { DESCRIPCION_NIVEL, NOTA_GRAFIA_PROVISIONAL } from '$lib/domain/evidencia';
	import { usarDiccionario } from '$lib/stores/contexto.svelte';
	import AccionesPalabra from '$lib/componentes/AccionesPalabra.svelte';

	const diccionario = usarDiccionario();

	const id = $derived(page.params.id ?? '');
	const entrada = $derived(diccionario.porId(id));

	const fuentes = $derived(
		(entrada?.fuentes ?? []).map((f) => diccionario.fuente(f)).filter((f) => f !== undefined)
	);

	/*
		El título de la página es el significado, no la forma: la forma ya aparece
		grande en el cuerpo, envuelta en su EvidenceBadge. Repetirla arriba es
		redundante, y el significado da contexto de qué se está mirando —además de
		servir mejor en la pestaña del navegador.
	*/
	const titulo = $derived(entrada?.significados[0] ?? 'Palabra');

	/*
		Estado intermedio traicionero: mientras el corpus carga, `porId` devuelve
		undefined para TODO. Si acá se mostrara "no existe", la app mentiría medio
		segundo en cada visita directa a un enlace compartido.
	*/
	const cargando = $derived(diccionario.estado === 'cargando' || diccionario.estado === 'inicial');
	/*
		Conserva la búsqueda al volver. En iOS una PWA instalada NO tiene botón
		atrás del sistema, así que este enlace es la única salida: mandarlo al
		buscador vacío obligaría a escribir todo de nuevo.
	*/
	const volver = $derived(
		diccionario.consulta.trim() ? `/?q=${encodeURIComponent(diccionario.consulta)}` : '/'
	);
</script>

<AppViewLayout {titulo}>
	{#if cargando}
		<p class="estado">Cargando el diccionario…</p>
	{:else if diccionario.estado === 'error'}
		<p class="estado estado--error">
			No se pudieron cargar los datos. Revisá la conexión y volvé a intentar.
		</p>
	{:else if !entrada}
		<p class="estado">No hay ninguna palabra con el identificador «{id}».</p>
		<p><a href={volver}>Volver al buscador</a></p>
	{:else}
		<article class="palabra">
			<p class="palabra__forma">
				<EvidenceBadge
					nivel={entrada.nivel_evidencia}
					grafiaProvisional={entrada.grafia_provisional}
				>
					{entrada.forma_clck}
				</EvidenceBadge>
			</p>

			<p class="palabra__significados">{entrada.significados.join(', ')}</p>

			<dl class="palabra__datos">
				<dt>Evidencia</dt>
				<dd>{DESCRIPCION_NIVEL[entrada.nivel_evidencia]}</dd>

				{#if entrada.grafia_provisional}
					<dt>Grafía</dt>
					<dd>
						{NOTA_GRAFIA_PROVISIONAL}. La grafía unificada la define el Grafemario del Consejo
						Lingüístico Ckunsa, que este proyecto todavía no pudo consultar.
					</dd>
				{/if}

				{#if entrada.campo_semantico}
					<dt>Campo semántico</dt>
					<dd>{entrada.campo_semantico}</dd>
				{/if}

				{#if entrada.transcripcion_fonologica}
					<dt>Transcripción</dt>
					<dd class="ck-afi">{entrada.transcripcion_fonologica}</dd>
				{/if}

				<!-- Verbatim, tal como la escribió la fuente. No se parsea (03 §2.5). -->
				{#if entrada.observaciones}
					<dt>Nota de la fuente</dt>
					<dd class="palabra__observaciones">{entrada.observaciones}</dd>
				{/if}
			</dl>

			<AccionesPalabra
				forma={entrada.forma_clck}
				significado={entrada.significados.join(', ')}
				url={page.url.href}
			/>

			{#if entrada.estado === 'retirada'}
				<p class="ficha__retirada">Esta forma fue retirada: {entrada.motivo_retiro}</p>
			{/if}

			<!-- La cita va en la ficha, no escondida en un tooltip (07-DISENO V4). -->
			<section class="palabra__fuentes">
				<h2 class="palabra__subtitulo">De dónde sale esta palabra</h2>
				{#each fuentes as fuente (fuente.id)}
					<CitaFuente {fuente} formato="completa" />
				{/each}
			</section>
		</article>

		<p><a href={volver}>Volver al buscador</a></p>
	{/if}
</AppViewLayout>
