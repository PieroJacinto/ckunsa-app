<!--
	Una ficha por forma. Consecuencia visual de D12: buscar "cueva" muestra
	`toco` y `ckoiba` como dos tarjetas separadas, nunca fundidas en una
	(`07-DISENO` V5.2).

	La forma en ckunsa NUNCA se renderiza suelta: va envuelta en EvidenceBadge,
	que es la regla 1 del proyecto. Si algún día alguien saca ese envoltorio,
	una forma reconstruida se vería igual que una documentada.
-->
<script lang="ts">
	import { DESCRIPCION_MOTIVO, type MotivoCoincidencia } from '$lib/domain/busqueda';
	import type { Entrada, Fuente } from '$lib/domain/tipos';

	import CitaFuente from './CitaFuente.svelte';
	import EvidenceBadge from './EvidenceBadge.svelte';

	type Props = {
		entrada: Entrada;
		/** Si viene, se cita en formato compacto. */
		fuente?: Fuente;
		motivo?: MotivoCoincidencia;
		/** Explicación puntual del buscador, más precisa que la genérica. */
		detalle?: string;
		/**
		 * Mostrar la nota de grafía provisional en esta tarjeta.
		 *
		 * Por defecto NO, porque en un listado la llevan las 851 entradas y una
		 * advertencia que aparece en todos los ítems deja de informar (V4.1). El
		 * listado la dice una vez arriba; la ficha de palabra la pasa en `true`.
		 */
		mostrarNotaGrafia?: boolean;
	};

	let { entrada, fuente, motivo, detalle, mostrarNotaGrafia = false }: Props = $props();

	const aviso = $derived(motivo ? DESCRIPCION_MOTIVO[motivo] : null);
</script>

<article class="ficha">
	<h2 class="ficha__titulo">
		<a class="ficha__enlace" href="/palabra/{entrada.id}">
			<EvidenceBadge
				nivel={entrada.nivel_evidencia}
				grafiaProvisional={mostrarNotaGrafia && entrada.grafia_provisional}
			>
				{entrada.forma_clck}
			</EvidenceBadge>
		</a>
	</h2>

	<p class="ficha__significados">{entrada.significados.join(', ')}</p>

	{#if entrada.campo_semantico}
		<p class="ficha__campo">{entrada.campo_semantico}</p>
	{/if}

	<!-- Sólo cuando el usuario no esperaba esta coincidencia. Es didáctico. -->
	{#if aviso}
		<p class="ficha__coincidencia">{detalle ?? aviso}</p>
	{/if}

	<!-- Nunca se borra una entrada: quien la busca encuentra la explicación. -->
	{#if entrada.estado === 'retirada'}
		<p class="ficha__retirada">Esta forma fue retirada: {entrada.motivo_retiro}</p>
	{/if}

	{#if fuente}
		<p class="ficha__fuente"><CitaFuente {fuente} formato="compacta" /></p>
	{/if}
</article>
