<!--
	Botón de instalar dentro de la app.

	POR QUÉ EXISTE: Chrome esconde la instalación en el menú de tres puntos.
	Una docente en San Pedro no la va a encontrar ahí. Si la app se piensa para
	usarse sin señal, instalarla tiene que ser evidente, no un secreto del
	navegador.

	Cómo funciona: el navegador avisa con `beforeinstallprompt` cuando la app
	cumple los requisitos para instalarse. Se intercepta ese aviso, se guarda, y
	se muestra nuestro botón. Al tocarlo se dispara el diálogo nativo.

	Si el evento nunca llega, el botón no aparece — y eso mismo es el
	diagnóstico: significa que falta algún requisito de instalación.

	iOS es aparte: Safari no implementa ese evento, así que ahí se explican los
	pasos a mano.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	type EventoInstalacion = Event & {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	};

	let evento = $state<EventoInstalacion | null>(null);
	let yaInstalada = $state(false);
	let esIos = $state(false);
	let mostrarPasosIos = $state(false);

	const sePuedeInstalar = $derived(evento !== null && !yaInstalada);
	const mostrarIos = $derived(esIos && !yaInstalada);

	onMount(() => {
		// Si ya está instalada corre en modo standalone: no hay nada que ofrecer.
		yaInstalada =
			window.matchMedia('(display-mode: standalone)').matches ||
			('standalone' in navigator && (navigator as never as { standalone: boolean }).standalone);

		const ua = navigator.userAgent;
		esIos = /iPad|iPhone|iPod/.test(ua) && !('onbeforeinstallprompt' in window);

		const alPoderInstalar = (e: Event) => {
			e.preventDefault(); // sin esto, Chrome muestra su propio aviso y el nuestro no sirve
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

{#if sePuedeInstalar}
	<div class="instalar">
		<p class="instalar__texto">
			<strong>Instalá el diccionario</strong> para usarlo sin conexión, como cualquier aplicación.
		</p>
		<button class="instalar__boton" type="button" onclick={instalar}>Instalar</button>
	</div>
{:else if mostrarIos}
	<div class="instalar">
		<p class="instalar__texto">
			<strong>Instalá el diccionario</strong> para usarlo sin conexión.
		</p>
		<button
			class="instalar__boton"
			type="button"
			aria-expanded={mostrarPasosIos}
			onclick={() => (mostrarPasosIos = !mostrarPasosIos)}>Cómo</button
		>
		{#if mostrarPasosIos}
			<ol class="instalar__pasos">
				<li>Tocá el botón de compartir, abajo en el medio.</li>
				<li>Deslizá y elegí «Agregar a pantalla de inicio».</li>
				<li>Confirmá con «Agregar».</li>
			</ol>
		{/if}
	</div>
{/if}
