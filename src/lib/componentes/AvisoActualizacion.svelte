<!--
	Aviso de versión nueva de la APLICACIÓN.

	POR QUÉ HAY UNA COMPROBACIÓN PERIÓDICA: el navegador sólo busca versiones
	nuevas del service worker cuando se navega de página. Esta app es una SPA —
	la navegación es interna y no recarga nada—, así que sin esto puede pasar
	días sin enterarse de que hay una versión nueva. El banner no aparecería
	nunca.

	Se sigue el patrón documentado por vite-plugin-pwa, con sus casos borde: no
	chequear si el service worker ya está instalando, ni si el dispositivo está
	sin conexión, y verificar que el servidor responda 200 antes de pedir la
	actualización.

	Se agrega un chequeo al volver a la app (`visibilitychange`), que en la
	práctica sirve más que uno cada hora: alguien abre el diccionario, lo deja, y
	vuelve a los dos días.

	NO se recarga sola (`registerType: 'prompt'`): hacerlo mientras alguien lee
	una ficha es hostil (`01-ARQUITECTURA` §7). La decisión es del usuario.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	/** Cada hora. El intervalo va en milisegundos. */
	const CADA = 60 * 60 * 1000;

	let hayActualizacion = $state(false);
	let listoOffline = $state(false);
	let aplicando = $state(false);
	let actualizar: ((recargar?: boolean) => Promise<void>) | null = null;

	onMount(() => {
		let limpiar: (() => void) | undefined;

		void (async () => {
			// Import dinámico: `virtual:pwa-register` sólo existe cuando corre el
			// plugin, y así no se ejecuta en el servidor ni en los tests.
			const { registerSW } = await import('virtual:pwa-register');

			actualizar = registerSW({
				immediate: true,

				onNeedRefresh() {
					hayActualizacion = true;
				},

				onOfflineReady() {
					listoOffline = true;
				},

				onRegisteredSW(urlSw, registro) {
					if (!registro) return;

					const revisar = async () => {
						if (registro.installing) return;
						if ('connection' in navigator && !navigator.onLine) return;

						try {
							const r = await fetch(urlSw, {
								cache: 'no-store',
								headers: { 'cache-control': 'no-cache' }
							});
							if (r.status === 200) await registro.update();
						} catch {
							// Sin conexión o servidor caído: se reintenta en el próximo ciclo.
							// No es un problema del usuario y no tiene que ensuciar la pantalla.
						}
					};

					void revisar(); // una vez al arrancar
					const reloj = setInterval(revisar, CADA);

					const alVolver = () => {
						if (document.visibilityState === 'visible') void revisar();
					};
					document.addEventListener('visibilitychange', alVolver);

					limpiar = () => {
						clearInterval(reloj);
						document.removeEventListener('visibilitychange', alVolver);
					};
				}
			});
		})();

		return () => limpiar?.();
	});

	/*
		`registerSW` sólo manda `skipWaiting` al service worker en espera; la
		recarga la dispara después el evento `controlling`. Si no hay ninguno
		esperando, ese evento nunca ocurre y el botón no haría nada. Por eso
		recargamos nosotros como respaldo.
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
		<p class="aviso-sw__texto">Hay una versión nueva del diccionario.</p>
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
