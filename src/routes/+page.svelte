<!--
	Buscador. Ruta FINA: pide el diccionario del contexto y pasa props.
	Ninguna lógica de búsqueda vive acá (`01-ARQUITECTURA` §3).
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AppViewLayout from '$lib/componentes/AppViewLayout.svelte';
	import BuscadorInput from '$lib/componentes/BuscadorInput.svelte';
	import EntradaCard from '$lib/componentes/EntradaCard.svelte';
	import { usarDiccionario } from '$lib/stores/contexto.svelte';
	import Bienvenida from '$lib/componentes/Bienvenida.svelte';

	const diccionario = usarDiccionario();

	/*
		LA CONSULTA VIVE EN LA URL.

		Sin esto, buscar «cueva» no cambia la dirección: no se puede compartir el
		resultado, recargar lo pierde, y volver de una ficha con el botón «atrás»
		devuelve al buscador vacío. En este proyecto compartir un enlace por
		mensaje es como circula la información entre docentes, así que importa.

		Dos direcciones, y la trampa está en que no se pisen:
		- store → URL, con espera. Una navegación por cada tecla sería demasiado.
		  La búsqueda en sí NO espera: los resultados salen al instante y lo único
		  que se demora es reescribir la dirección.
		- URL → store, SÓLO cuando el cambio viene de afuera: un enlace
		  compartido, el botón «atrás» o una recarga.

		Esa última condición no es un detalle. Sin ella, cuando se escribe la URL
		el efecto se dispara con el texto de hace 300 ms y pisa lo que el usuario
		acaba de teclear: se comía letras mientras escribías.
	*/
	const ESPERA = 300;
	let reloj: ReturnType<typeof setTimeout> | undefined;

	// `let` común y no `$state`: si fuera reactivo, cambiarlo volvería a
	// disparar el efecto de abajo, que es justo lo que se quiere evitar.
	let escritaPorNosotros = '';

	$effect(() => {
		const enUrl = page.url.searchParams.get('q') ?? '';

		if (enUrl === escritaPorNosotros) return;
		if (enUrl !== diccionario.consulta) diccionario.buscar(enUrl);
	});

	function alBuscar(consulta: string) {
		// Primero el store: los resultados no esperan a la URL.
		diccionario.buscar(consulta);

		clearTimeout(reloj);
		reloj = setTimeout(() => {
			escritaPorNosotros = consulta;

			const url = new URL(page.url);
			if (consulta.trim()) url.searchParams.set('q', consulta);
			else url.searchParams.delete('q');

			// replaceState: escribir «cueva» no debe dejar cinco entradas en el
			// historial, una por letra.
			void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
		}, ESPERA);
	}

	const subtitulo = $derived(
		diccionario.estado === 'listo' ? `${diccionario.total} palabras` : undefined
	);
</script>

<AppViewLayout titulo="Diccionario ckunsa" {subtitulo}>
	<BuscadorInput
		valor={diccionario.consulta}
		onBuscar={alBuscar}
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
		<Bienvenida onEjemplo={alBuscar} />
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
