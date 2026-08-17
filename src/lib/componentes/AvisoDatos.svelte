<!--
	Aviso de que hay palabras nuevas.

	Distinto del aviso de versión de la APLICACIÓN: ese lo maneja el service
	worker y exige recargar. Este trae un JSON y ya. Son dos cosas separadas a
	propósito (`01-ARQUITECTURA` §7): agregar 200 palabras tiene que ser subir un
	archivo y bumpear el manifest, sin publicar una versión nueva de la app.

	Se revisa al arrancar y cada vez que el usuario vuelve a la app, que en la
	práctica es cuando conviene: alguien la abre, la deja, y vuelve a los días.

	Nunca se aplica sola. Cambiar el diccionario bajo los pies de quien está
	leyendo una ficha es la misma hostilidad que recargar sin avisar.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	import { usarDiccionario } from '$lib/stores/contexto.svelte';

	const diccionario = usarDiccionario();

	let aplicando = $state(false);

	const opciones = () => ({ fetch: window.fetch.bind(window) });

	onMount(() => {
		const revisar = () => {
			if (!navigator.onLine) return;
			if (diccionario.estado !== 'listo') return;

			void diccionario.revisarActualizacion(opciones());
		};

		revisar();

		const alVolver = () => {
			if (document.visibilityState === 'visible') revisar();
		};

		document.addEventListener('visibilitychange', alVolver);
		return () => document.removeEventListener('visibilitychange', alVolver);
	});

	async function aplicar() {
		aplicando = true;

		try {
			await diccionario.aplicarActualizacion(opciones());
		} finally {
			aplicando = false;
		}
	}
</script>

{#if diccionario.hayActualizacion}
	<div class="aviso-sw" role="status">
		<p class="aviso-sw__texto">Hay palabras nuevas en el diccionario.</p>
		<button class="aviso-sw__accion" type="button" onclick={aplicar} disabled={aplicando}>
			{aplicando ? 'Actualizando…' : 'Actualizar'}
		</button>
	</div>
{/if}
