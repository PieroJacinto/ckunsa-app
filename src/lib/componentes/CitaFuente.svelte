<!--
	Atribución de una fuente. NO es decorativo: las licencias la exigen
	(`04-DATOS-Y-FUENTES` §1) y además es el argumento pedagógico del proyecto —
	el chico ve de dónde sale la palabra.

	Dos formatos, porque CC BY pide atribución "reasonable to the medium":

	- `completa` en la ficha de palabra y en /fuentes: cita, licencia y enlace.
	- `compacta` en las tarjetas de resultado, donde puede haber 50: autor y año,
	  enlazados al ancla de /fuentes. Creative Commons admite variar el nivel de
	  detalle según el medio, siempre que el usuario pueda llegar al dato
	  completo — de ahí que la versión corta SIEMPRE sea un enlace.

	La atribución nunca desaparece: cambia de detalle según el contexto.
-->
<script lang="ts">
	import type { Fuente } from '$lib/domain/tipos';

	type Props = {
		fuente: Fuente;
		formato?: 'compacta' | 'completa';
	};

	let { fuente, formato = 'completa' }: Props = $props();
</script>

{#if formato === 'compacta'}
	<a class="cita cita--compacta" href="/fuentes#{fuente.id}">{fuente.cita_corta}</a>
{:else}
	<!-- El id es el destino del enlace compacto. -->
	<div class="cita cita--completa" id={fuente.id}>
		<p class="cita__texto">{fuente.cita}</p>
		<p class="cita__licencia">
			Licencia: {fuente.licencia}
			{#if fuente.url}
				· <a href={fuente.url} rel="noreferrer">{fuente.url}</a>
			{/if}
		</p>
	</div>
{/if}
