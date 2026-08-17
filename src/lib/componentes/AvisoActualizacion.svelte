<!--
	Aviso de versión nueva de la APLICACIÓN.

	El service worker se registra con `registerType: 'prompt'`: cuando hay una
	versión nueva NO se recarga sola. Recargar de prepo mientras alguien está
	leyendo una ficha es hostil (`01-ARQUITECTURA` §7), así que la decisión es
	del usuario.

	El registro va con import dinámico dentro de `onMount` por dos razones:
	`virtual:pwa-register` es un módulo virtual que sólo existe cuando corre el
	plugin, y así no se ejecuta en el servidor ni en los tests.

	Se usa la API genérica con callbacks y no la variante de Svelte, que devuelve
	stores del sistema viejo: todo el proyecto usa runes.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	let hayActualizacion = $state(false);
	let listoOffline = $state(false);
	let actualizar: ((recargar?: boolean) => Promise<void>) | null = null;
	let aplicando = $state(false);

	onMount(async () => {
		const { registerSW } = await import('virtual:pwa-register');

		actualizar = registerSW({
			onNeedRefresh() {
				hayActualizacion = true;
			},
			onOfflineReady() {
				listoOffline = true;
			}
		});
	});

	/*
		`registerSW` devuelve una función que sólo manda `skipWaiting` al service
		worker en espera; la recarga la dispara después el evento `controlling`.

		Si no hay ninguno esperando —porque ya se activó solo en una recarga
		anterior— ese evento nunca ocurre y el botón no hace nada. Por eso
		recargamos nosotros como respaldo: con worker en espera la recarga ya
		habrá ocurrido, y sin él es la única forma de que el usuario vea la
		versión nueva.
	*/
	async function aplicar() {
		aplicando = true;

		try {
			await actualizar?.();
		} finally {
			location.reload();
		}
	}

	function descartar() {
		hayActualizacion = false;
		listoOffline = false;
	}
</script>

{#if hayActualizacion}
	<div class="aviso-sw" role="status">
		<p class="aviso-sw__texto">Hay una versión nueva de la aplicación.</p>
		<button class="aviso-sw__accion" type="button" onclick={aplicar} disabled={aplicando}>
			{aplicando ? 'Actualizando…' : 'Actualizar'}
		</button>
		<button class="aviso-sw__cerrar" type="button" onclick={descartar}>Ahora no</button>
	</div>
{:else if listoOffline}
	<div class="aviso-sw" role="status">
		<p class="aviso-sw__texto">Listo para funcionar sin conexión.</p>
		<button class="aviso-sw__cerrar" type="button" onclick={descartar}>Entendido</button>
	</div>
{/if}
