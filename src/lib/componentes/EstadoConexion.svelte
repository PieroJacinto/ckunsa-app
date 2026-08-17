<!--
	Aviso de que no hay conexión.

	La app funciona igual sin señal — es su razón de ser— pero el usuario no
	tiene cómo saberlo: puede pensar que está viendo algo roto o desactualizado.
	Por eso el texto no alarma, tranquiliza: no hay señal, y justamente por eso
	estás usando lo que ya está guardado.

	Sólo aparece cuando NO hay conexión. Un indicador permanente de "conectado"
	sería ruido en una app que no depende de estar conectada.

	`navigator.onLine` no es del todo confiable en positivo —da true si estás
	enganchado a un router sin internet—, pero en negativo sí: cuando dice que
	no hay red, no hay red. Eso alcanza para este aviso.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	let sinConexion = $state(false);

	// En onMount y no al declarar: en el servidor no hay `navigator`.
	onMount(() => {
		sinConexion = !navigator.onLine;

		const perdida = () => (sinConexion = true);
		const vuelta = () => (sinConexion = false);

		window.addEventListener('offline', perdida);
		window.addEventListener('online', vuelta);

		return () => {
			window.removeEventListener('offline', perdida);
			window.removeEventListener('online', vuelta);
		};
	});
</script>

{#if sinConexion}
	<p class="conexion" role="status" aria-live="polite">
		Sin conexión. Podés seguir usando el diccionario: está guardado en tu dispositivo.
	</p>
{/if}
