<!--
	El `PermissionGate` de este proyecto.

	En Bridge se envuelve la UI que depende de un permiso. Acá el riesgo no es de
	seguridad sino de FALSA AUTORIDAD: si una forma reconstruida se muestra igual
	que una atestiguada, un chico la copia en la carpeta y esa forma queda
	circulando como dato firme. En una lengua dormida ese error no se corrige.

	REGLA: toda forma en ckunsa renderizada al usuario pasa por acá. Nunca texto
	pelado (`01-ARQUITECTURA` §4, regla 1 del proyecto).

	Los tres canales van siempre juntos: color + ícono + palabra escrita. El color
	solo no alcanza (WCAG 1.4.1) y además es ininteligible para quien entra por
	primera vez: la palabra es la que enseña.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	import {
		DESCRIPCION_NIVEL,
		ETIQUETA_NIVEL,
		ICONO_NIVEL,
		NOTA_GRAFIA_PROVISIONAL
	} from '$lib/domain/evidencia';
	import type { NivelEvidencia } from '$lib/domain/tipos';

	type Props = {
		nivel: NivelEvidencia;
		/** Segunda marca, eje distinto: la ortografía (`03` §2.4). */
		grafiaProvisional?: boolean;
		/** La forma en ckunsa. Va como snippet: el badge envuelve, no recibe texto. */
		children: Snippet;
	};

	let { nivel, grafiaProvisional = false, children }: Props = $props();

	const etiqueta = $derived(ETIQUETA_NIVEL[nivel]);
	const descripcion = $derived(DESCRIPCION_NIVEL[nivel]);
	const icono = $derived(ICONO_NIVEL[nivel]);
</script>

<span class="evidencia" data-nivel={nivel}>
	<span class="evidencia__forma">{@render children()}</span>

	<!--
		El ícono es decorativo para el lector de pantalla: la palabra de al lado
		dice lo mismo, y anunciarlo dos veces es ruido.
	-->
	<span class="evidencia__marca evidencia__marca--{nivel}" title={descripcion}>
		<svg
			class="evidencia__icono"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			{#if icono === 'libro'}
				<path d="M2.5 3h4a2 2 0 0 1 2 2v8a1.5 1.5 0 0 0-1.5-1.5h-4.5z" />
				<path d="M13.5 3h-4a2 2 0 0 0-2 2v8a1.5 1.5 0 0 1 1.5-1.5h4.5z" />
			{:else if icono === 'tilde'}
				<path d="M3 8.5 6.5 12 13 4.5" />
			{:else if icono === 'herramienta'}
				<path
					d="M10.5 2.5a3.5 3.5 0 0 0-4.4 4.4L2.5 10.5v3h3l3.6-3.6a3.5 3.5 0 0 0 4.4-4.4l-2 2-1.9-.5-.5-1.9z"
				/>
			{:else if icono === 'comunidad'}
				<circle cx="5.5" cy="5.5" r="2" />
				<circle cx="11" cy="6.5" r="1.6" />
				<path d="M1.5 13c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" />
				<path d="M11 9.5c2 0 3.5 1.1 3.5 3" />
			{/if}
		</svg>
		<span class="evidencia__texto">{etiqueta}</span>
	</span>

	{#if grafiaProvisional}
		<span class="evidencia__grafia">{NOTA_GRAFIA_PROVISIONAL}</span>
	{/if}
</span>
