<!--
	Buscador único, sin selector de idioma: la búsqueda es bidireccional
	(`03` §4) y pedirle al usuario que elija dirección sería exponerle una
	decisión que el sistema ya resuelve (`07-DISENO` V5.3).

	Componente CONTROLADO: no guarda estado. Recibe el valor y avisa los cambios.
	La consulta vive en el store, que es donde corresponde; si el input guardara
	su propio valor habría dos fuentes de verdad para lo mismo.

	Sin debounce: medido, la búsqueda cuesta 0,17 ms con el corpus actual y
	0,61 ms con 5.000 entradas. Un timer agregaría estado que testear y un
	retraso perceptible para resolver un problema que no tenemos.
-->
<script lang="ts">
	type Props = {
		valor: string;
		onBuscar: (consulta: string) => void;
		/** Para el anuncio a lectores de pantalla. */
		cantidadResultados?: number;
		placeholder?: string;
	};

	let {
		valor,
		onBuscar,
		cantidadResultados,
		placeholder = 'ckabur, montaña, agua…'
	}: Props = $props();

	let campo = $state<HTMLInputElement | undefined>(undefined);

	const anuncio = $derived.by(() => {
		if (valor.trim() === '' || cantidadResultados === undefined) return '';
		if (cantidadResultados === 0) return 'Sin resultados';
		if (cantidadResultados === 1) return '1 resultado';
		return `${cantidadResultados} resultados`;
	});

	/**
	 * El foco vuelve al campo: mientras alguien escribe, el foco tiene que
	 * quedarse en la barra para que pueda seguir modificando la consulta. Si el
	 * botón desaparece con el foco puesto, quien navega con teclado queda en la
	 * nada.
	 */
	function limpiar() {
		onBuscar('');
		campo?.focus();
	}
</script>

<div class="buscador">
	<!--
		Label real, no placeholder: el placeholder desaparece al escribir y tiene
		contraste insuficiente, así que no sirve como etiqueta. Va oculto
		visualmente pero presente para el lector de pantalla.
	-->
	<label class="buscador__etiqueta visualmente-oculto" for="buscador-consulta">
		Buscar en ckunsa o en español
	</label>

	<div class="buscador__campo">
		<svg
			class="buscador__lupa"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			aria-hidden="true"
		>
			<circle cx="7" cy="7" r="4.5" />
			<path d="M10.5 10.5 14 14" />
		</svg>

		<input
			bind:this={campo}
			id="buscador-consulta"
			class="buscador__input"
			type="search"
			autocomplete="off"
			spellcheck="false"
			{placeholder}
			value={valor}
			oninput={(e) => onBuscar(e.currentTarget.value)}
		/>

		{#if valor !== ''}
			<!--
				Texto oculto adentro del botón en vez de sólo aria-label: se traduce,
				funciona con control por voz y da el nombre accesible sin depender de
				ARIA. El title lo hace descubrible para quien usa mouse.
			-->
			<button class="buscador__limpiar" type="button" title="Limpiar la búsqueda" onclick={limpiar}>
				<svg
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<path d="M4 4l8 8M12 4l-8 8" />
				</svg>
				<span class="visualmente-oculto">Limpiar la búsqueda</span>
			</button>
		{/if}
	</div>

	<!--
		La región viva se renderiza SIEMPRE, aunque esté vacía: los lectores de
		pantalla anuncian cambios dentro de una región existente, no la aparición
		de la región. Si se creara recién al haber resultados, no se anunciaría.
	-->
	<p class="buscador__anuncio visualmente-oculto" role="status" aria-live="polite">{anuncio}</p>
</div>
