<!--
	Invitación a instalar.

	POR QUÉ EXISTE: los navegadores esconden la instalación en un menú que una
	docente en San Pedro no va a encontrar. Si la app se piensa para usarse sin
	señal, instalarla tiene que ser evidente.

	CUÁNDO SE MUESTRA, que es la parte delicada. Cuando el evento
	`beforeinstallprompt` no llega, no se puede distinguir «ya está instalada» de
	«este navegador no puede instalarla»: en los dos casos no pasa nada.

	Lo que sí se sabe es qué navegadores NUNCA disparan ese evento —Safari en
	iPhone, Firefox, y Samsung Internet en versiones recientes—. Ahí su ausencia
	no informa nada y corresponde ofrecer las instrucciones.

	En los basados en Chromium pasa lo contrario: si puede instalarla, avisa. Si
	no avisó, o ya está instalada o no se puede, y en ambos casos no hay nada que
	ofrecer. Por eso el recuadro desaparece solo después de instalar.

	SE PUEDE DESCARTAR, y la elección se recuerda. La guía de promoción de
	instalación es explícita: hay que poder descartarla, recordar la preferencia
	y no insistir. Se guarda la fecha y se vuelve a ofrecer recién a los 30 días
	— no para siempre, porque alguien puede cambiar de opinión después de usar la
	app un tiempo.

	LAS INSTRUCCIONES NO ESTÁN ACÁ: viven en `/instalar`, que es una página con
	URL propia y por lo tanto se puede mandar por mensaje a quien no puede
	instalarla. Una sola fuente de verdad, y sigue disponible aunque alguien
	haya descartado esta invitación.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	type EventoInstalacion = Event & {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	};

	type Plataforma = 'ios' | 'samsung' | 'firefox' | 'otro';

	/** Navegadores que nunca disparan `beforeinstallprompt`. */
	const NUNCA_AVISAN: Plataforma[] = ['ios', 'samsung', 'firefox'];

	const CLAVE = 'ck:instalar-descartado';
	const ESPERA = 30 * 24 * 60 * 60 * 1000; // 30 días

	let evento = $state<EventoInstalacion | null>(null);
	let plataforma = $state<Plataforma>('otro');
	let descartado = $state(false);

	// Arranca en true: mostrar la invitación y esconderla enseguida sería peor
	// que no mostrarla.
	let yaInstalada = $state(true);

	const sePuedeInstalar = $derived(evento !== null && !yaInstalada && !descartado);

	const mostrarInstrucciones = $derived(
		evento === null && !yaInstalada && !descartado && NUNCA_AVISAN.includes(plataforma)
	);

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

		// En navegación privada el almacenamiento puede fallar: si no se puede
		// leer, se muestra igual. Perder la preferencia es menos grave que romper.
		try {
			const cuando = Number(localStorage.getItem(CLAVE) ?? 0);
			descartado = cuando > 0 && Date.now() - cuando < ESPERA;
		} catch {
			descartado = false;
		}

		/*
			El evento se dispara al cargar la página, mucho antes de que exista este
			componente. Un script en `app.html` lo captura y lo guarda; acá se
			recoge. Sin eso, el botón no aparecía nunca aunque el navegador sí
			ofreciera instalar.
		*/
		const guardado = (window as { __promptInstalacion?: EventoInstalacion }).__promptInstalacion;
		if (guardado) evento = guardado;

		const alPoderInstalar = () => {
			evento = (window as { __promptInstalacion?: EventoInstalacion }).__promptInstalacion ?? null;
		};

		const alInstalar = () => {
			yaInstalada = true;
			evento = null;
		};

		window.addEventListener('ck:instalable', alPoderInstalar);
		window.addEventListener('appinstalled', alInstalar);

		return () => {
			window.removeEventListener('ck:instalable', alPoderInstalar);
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
		(window as { __promptInstalacion?: EventoInstalacion | null }).__promptInstalacion = null;
	}

	function descartar() {
		descartado = true;

		try {
			localStorage.setItem(CLAVE, String(Date.now()));
		} catch {
			// Sin almacenamiento la preferencia no sobrevive a la recarga, pero al
			// menos desaparece en esta sesión.
		}
	}
</script>

{#if sePuedeInstalar || mostrarInstrucciones}
	<div class="instalar">
		<p class="instalar__texto">
			<strong>Llevátelo en el teléfono</strong> para abrirlo como cualquier aplicación.
		</p>

		<div class="instalar__acciones">
			{#if sePuedeInstalar}
				<button class="instalar__boton" type="button" onclick={instalar}>Instalar</button>
			{:else}
				<a class="instalar__boton" href="/instalar">Cómo se hace</a>
			{/if}

			<button class="instalar__cerrar" type="button" onclick={descartar}>Ahora no</button>
		</div>

		<p class="instalar__nota">
			No hace falta instalarlo: acá en el navegador funciona igual, también sin conexión. Instalarlo
			sólo agrega el ícono en la pantalla.
		</p>
	</div>
{/if}
