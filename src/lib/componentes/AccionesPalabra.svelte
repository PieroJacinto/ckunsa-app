<!--
	Copiar y compartir una palabra.

	Copiar sirve a quien arma material: un docente que pasa la forma a una
	pizarra o a una ficha impresa no debería tener que seleccionarla a mano.

	Compartir usa el menú del sistema, que en un teléfono lleva directo a
	WhatsApp — que es como circula la información en el territorio. Sólo tiene
	sentido desde que la búsqueda y la ficha viven en la URL.

	`navigator.share` no existe en todos los navegadores, así que se detecta en
	`onMount` y cuando no está se ofrece copiar el enlace. No se muestra un botón
	que no va a funcionar.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		forma: string;
		significado: string;
		url: string;
	};

	let { forma, significado, url }: Props = $props();

	let aviso = $state('');
	let puedeCompartir = $state(false);

	// En onMount y no al declarar: en el servidor no hay `navigator`.
	onMount(() => {
		puedeCompartir = typeof navigator.share === 'function';
	});

	function avisar(texto: string) {
		aviso = texto;
		setTimeout(() => (aviso = ''), 2500);
	}

	async function copiar(texto: string, mensaje: string) {
		try {
			await navigator.clipboard.writeText(texto);
			avisar(mensaje);
		} catch {
			avisar('No se pudo copiar');
		}
	}

	async function compartir() {
		try {
			await navigator.share({
				title: `${forma} · Diccionario ckunsa`,
				text: `${forma}: ${significado}`,
				url
			});
		} catch {
			// El usuario canceló, o el navegador rechazó. No es un error que mostrar.
		}
	}
</script>

<div class="acciones">
	<button class="acciones__boton" type="button" onclick={() => copiar(forma, 'Palabra copiada')}
		>Copiar palabra</button
	>

	{#if puedeCompartir}
		<button class="acciones__boton" type="button" onclick={compartir}>Compartir</button>
	{:else}
		<button class="acciones__boton" type="button" onclick={() => copiar(url, 'Enlace copiado')}
			>Copiar enlace</button
		>
	{/if}

	<!-- Región viva: el resultado se anuncia, no sólo se ve. -->
	<p class="acciones__aviso" role="status" aria-live="polite">{aviso}</p>
</div>
