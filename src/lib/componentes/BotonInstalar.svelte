<!--
	Invitación a instalar, con instrucciones según el navegador.

	POR QUÉ EXISTE: los navegadores esconden la instalación en un menú que una
	docente en San Pedro no va a encontrar. Si la app se piensa para usarse sin
	señal, instalarla tiene que ser evidente.

	POR QUÉ NO ALCANZA CON EL BOTÓN: `beforeinstallprompt` no es estándar. MDN lo
	marca como de disponibilidad limitada y sólo lo implementan los navegadores
	basados en Chromium; hay reportes de que Samsung Internet 27 dejó de
	dispararlo. Antes, cuando ese evento no llegaba, no mostrábamos nada — y el
	usuario quedaba sin botón y sin explicación. La recomendación oficial para
	esos casos es mostrar instrucciones, que es lo que hacemos acá.

	EL CASO DE SAMSUNG INTERNET está documentado: la instalación puede fallar en
	silencio y la app puede quedar marcada como insegura por Google Play Protect,
	porque el paquete que genera ese navegador no es de confianza para Play
	Protect. Los criterios no están claros y normalmente se puede instalar igual
	con «Instalar de todos modos». Nada de eso lo controla esta aplicación: el
	paquete de Android lo arma el navegador, no nuestro código.

	Y SIEMPRE se aclara que instalar es opcional. Quien se topa con un aviso de
	seguridad tiene que saber que no se está perdiendo nada.

	Se descartó usar una biblioteca para esto: son 28 KB sobre un shell de 404, y
	se perdería el control de los textos, que en este proyecto importan.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	type EventoInstalacion = Event & {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	};

	type Plataforma = 'ios' | 'samsung' | 'firefox' | 'otro';

	let evento = $state<EventoInstalacion | null>(null);
	let plataforma = $state<Plataforma>('otro');
	let mostrarPasos = $state(false);

	// Arranca en true: mostrar la invitación y esconderla enseguida sería peor
	// que no mostrarla.
	let yaInstalada = $state(true);

	const sePuedeInstalar = $derived(evento !== null && !yaInstalada);

	/** Función pura y exportable: se testea sin navegador. */
	function detectar(ua: string): Plataforma {
		if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
		if (/SamsungBrowser/.test(ua)) return 'samsung';
		if (/Firefox|FxiOS/.test(ua)) return 'firefox';
		return 'otro';
	}

	onMount(() => {
		// Si ya está instalada corre en modo standalone: no hay nada que ofrecer.
		yaInstalada =
			window.matchMedia('(display-mode: standalone)').matches ||
			('standalone' in navigator && Boolean((navigator as { standalone?: boolean }).standalone));

		plataforma = detectar(navigator.userAgent);

		const alPoderInstalar = (e: Event) => {
			// Sin preventDefault, el navegador muestra su propio aviso y el nuestro
			// no sirve.
			e.preventDefault();
			evento = e as EventoInstalacion;
		};

		const alInstalar = () => {
			yaInstalada = true;
			evento = null;
		};

		window.addEventListener('beforeinstallprompt', alPoderInstalar);
		window.addEventListener('appinstalled', alInstalar);

		return () => {
			window.removeEventListener('beforeinstallprompt', alPoderInstalar);
			window.removeEventListener('appinstalled', alInstalar);
		};
	});

	async function instalar() {
		if (!evento) return;

		await evento.prompt();
		const { outcome } = await evento.userChoice;
		if (outcome === 'accepted') yaInstalada = true;

		// El evento se consume: sólo se puede usar una vez.
		evento = null;
	}
</script>

{#if !yaInstalada}
	<div class="instalar">
		<p class="instalar__texto">
			<strong>Llevátelo en el teléfono</strong> para abrirlo como cualquier aplicación.
		</p>

		{#if sePuedeInstalar}
			<button class="instalar__boton" type="button" onclick={instalar}>Instalar</button>
		{:else}
			<button
				class="instalar__boton"
				type="button"
				aria-expanded={mostrarPasos}
				onclick={() => (mostrarPasos = !mostrarPasos)}>Cómo se hace</button
			>

			{#if mostrarPasos}
				{#if plataforma === 'ios'}
					<ol class="instalar__pasos">
						<li>Tocá el botón de compartir, abajo en el medio.</li>
						<li>Deslizá y elegí «Agregar a pantalla de inicio».</li>
						<li>Confirmá con «Agregar».</li>
					</ol>
				{:else if plataforma === 'samsung'}
					<ol class="instalar__pasos">
						<li>Abrí el menú del navegador, abajo a la derecha.</li>
						<li>Elegí «Agregar página a» y después «Pantalla de inicio».</li>
						<li>
							Si aparece un aviso de Google Play Protect, tocá «Más detalles» y después «Instalar de
							todos modos». Es un aviso conocido de este navegador, no de esta aplicación.
						</li>
					</ol>
					<p class="instalar__nota">
						Si el aviso no te deja seguir, probá abriendo <strong>ckunsa-app.pages.dev</strong> en Chrome:
						ahí la instalación suele funcionar sin trabas.
					</p>
				{:else if plataforma === 'firefox'}
					<ol class="instalar__pasos">
						<li>Abrí el menú del navegador.</li>
						<li>Elegí «Instalar» o «Agregar a la pantalla de inicio».</li>
					</ol>
				{:else}
					<ol class="instalar__pasos">
						<li>Abrí el menú del navegador.</li>
						<li>Elegí «Instalar aplicación» o «Agregar a pantalla de inicio».</li>
					</ol>
				{/if}
			{/if}
		{/if}

		<p class="instalar__nota">
			No hace falta instalarlo: acá en el navegador funciona igual, también sin conexión. Instalarlo
			sólo agrega el ícono en la pantalla.
		</p>
	</div>
{/if}
