<!--
	Buscador. Ruta FINA: pide el diccionario del contexto y pasa props.
	Ninguna lógica de búsqueda vive acá (`01-ARQUITECTURA` §3).
-->
<script lang="ts">
	import AppViewLayout from '$lib/componentes/AppViewLayout.svelte';
	import BuscadorInput from '$lib/componentes/BuscadorInput.svelte';
	import EntradaCard from '$lib/componentes/EntradaCard.svelte';
	import { usarDiccionario } from '$lib/stores/contexto.svelte';

	const diccionario = usarDiccionario();

	const subtitulo = $derived(
		diccionario.estado === 'listo' ? `${diccionario.total} palabras` : undefined
	);
</script>

<AppViewLayout titulo="Diccionario ckunsa" {subtitulo}>
	<BuscadorInput
		valor={diccionario.consulta}
		onBuscar={(q) => diccionario.buscar(q)}
		cantidadResultados={diccionario.estado === 'listo' ? diccionario.resultados.length : undefined}
	/>

	{#if diccionario.estado === 'listo' && diccionario.resultados.length > 0}
		<!--
			Una vez, no 851 veces (07-DISENO V4.1). En la ficha de palabra sí va la
			nota completa por entrada.
		-->
		<p class="aviso-grafia">
			Las formas están escritas en la grafía de sus fuentes. La normalización a la grafía unificada
			del Consejo Lingüístico Ckunsa está pendiente.
		</p>
	{/if}

	{#if diccionario.estado === 'cargando' || diccionario.estado === 'inicial'}
		<p class="estado">Cargando el diccionario…</p>
	{:else if diccionario.estado === 'error'}
		<!--
			En Atacama la señal no se da por sentada: quedarse sin datos es un caso
			previsto y hay que decir qué pasó, no mostrar un buscador vacío que
			parece roto.
		-->
		<p class="estado estado--error">
			No se pudieron cargar los datos. Revisá la conexión y volvé a intentar.
		</p>
	{:else if diccionario.consulta.trim() === ''}
		<p class="estado">
			Escribí una palabra en ckunsa o en español. La búsqueda funciona en las dos direcciones.
		</p>
	{:else if diccionario.resultados.length === 0}
		<p class="estado">No se encontró nada para «{diccionario.consulta}».</p>
	{:else}
		<ul class="resultados">
			{#each diccionario.resultados as resultado (resultado.entrada.id)}
				<li>
					<EntradaCard
						entrada={resultado.entrada}
						fuente={diccionario.fuente(resultado.entrada.fuentes[0] ?? '')}
						motivo={resultado.motivo}
						detalle={resultado.detalle}
					/>
				</li>
			{/each}
		</ul>
	{/if}
</AppViewLayout>
