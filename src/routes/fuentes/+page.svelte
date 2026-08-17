<!--
	Página obligatoria (`01-ARQUITECTURA` §6). No es un "about" decorativo:

	1. LEGAL — las licencias exigen atribución. Acá vive el TASL completo al que
	   apuntan todas las citas compactas de las tarjetas de resultado.
	2. PEDAGÓGICA — de qué está hecho el diccionario y qué le falta.
	3. COMUNITARIA — `05-PROTOCOLO` §6: las organizaciones lickanantay ANTES que
	   los desarrolladores, y la línea explícita de a quién pertenece la lengua.

	Ese orden no es cortesía: es la afirmación de a quién pertenece lo que la app
	muestra.

	Las fuentes se leen del store, no se hardcodean: cuando entre el corpus OSF o
	el material del CLCK aparecen solas.
-->
<script lang="ts">
	import AppViewLayout from '$lib/componentes/AppViewLayout.svelte';
	import CitaFuente from '$lib/componentes/CitaFuente.svelte';
	import { usarDiccionario } from '$lib/stores/contexto.svelte';

	const diccionario = usarDiccionario();

	const todas = $derived(diccionario.fuentes());

	/*
		Concepticon no documenta el ckunsa: aporta las glosas en español de los
		conceptos. Mezclarla con las fuentes de la lengua induciría a creer que es
		documentación del ckunsa (`03-MODELO-DE-DATOS` §2.2).
	*/
	const documentales = $derived(todas.filter((f) => f.tipo !== 'catalogo'));
	const catalogos = $derived(todas.filter((f) => f.tipo === 'catalogo'));
</script>

<AppViewLayout titulo="Fuentes y créditos">
	<p class="fuentes__patrimonio">
		El ckunsa es patrimonio del pueblo <strong>lickanantay</strong>. Esta aplicación reúne material
		publicado sobre la lengua; no la reemplaza ni la representa.
	</p>

	<section class="fuentes__seccion">
		<h2>Organizaciones del territorio</h2>
		<p>
			La autoridad sobre la lengua es de las organizaciones lickanantay. Estas son las instituciones
			a las que corresponde consultar sobre el ckunsa. <strong
				>Este proyecto todavía no cuenta con su aval</strong
			>: figuran acá como referencia, no como colaboradoras.
		</p>
		<ul>
			<li>
				<strong>Consejo Lingüístico Ckunsa (CLCK)</strong> — fundado el 14 de diciembre de 2010.
				Publicó el <em>Grafemario Unificado Ckunsa</em> (2018) y el
				<em>Diccionario Unificado Ckunsa</em> (2021), que definen la grafía oficial.
			</li>
			<li><strong>CONADI El Loa</strong></li>
			<li>
				<strong>Corporación Cultural La Huella Teatro</strong> — impulsa el proyecto
				<strong>Yockontur</strong> («hablar» en ckunsa), con patrocinio del CLCK, presentado por Escondida&nbsp;|
				BHP y apoyo de UNESCO. Lleva mediaciones educativas y diccionarios a las escuelas de Atacama La
				Grande.
			</li>
			<li><strong>Centro de Pensamiento Atacameño Ckunsa Ttulva</strong></li>
			<li>
				<strong>Educadores tradicionales</strong> de las escuelas de San Pedro de Atacama, Toconao, Peine,
				Socaire, Caspana y Chiu Chiu.
			</li>
		</ul>
	</section>

	<section class="fuentes__seccion">
		<h2>Fuentes de los datos</h2>

		{#if diccionario.estado !== 'listo'}
			<p class="estado">Cargando…</p>
		{:else}
			{#each documentales as fuente (fuente.id)}
				<div class="fuentes__item">
					<CitaFuente {fuente} formato="completa" />
				</div>
			{/each}
		{/if}
	</section>

	{#if catalogos.length > 0}
		<section class="fuentes__seccion">
			<h2>Catálogos de referencia</h2>
			<p>
				No documentan el ckunsa: son infraestructura. Aportan la lista de conceptos y sus glosas en
				español.
			</p>
			{#each catalogos as fuente (fuente.id)}
				<div class="fuentes__item">
					<CitaFuente {fuente} formato="completa" />
				</div>
			{/each}
		</section>
	{/if}

	<section class="fuentes__seccion">
		<h2>Qué falta</h2>
		<p>
			Las formas que muestra la aplicación están escritas en la grafía de sus fuentes, no en la
			grafía unificada del CLCK. Para normalizarlas hace falta el <em
				>Grafemario Unificado Ckunsa</em
			> (2018), que este proyecto todavía no pudo consultar.
		</p>
		<p>
			Tampoco están incorporados el <em>Diccionario Unificado Ckunsa</em> (2021) ni el corpus morfofonológico
			de Llanquiman, Hasler y Torrico-Ávila, cuyo uso requiere autorización.
		</p>
	</section>

	<section class="fuentes__seccion">
		<h2>Tipografía</h2>
		<p>
			Andika, de SIL Global, bajo <abbr title="SIL Open Font License">OFL</abbr> 1.1. Diseñada para materiales
			de alfabetización y con soporte de alfabeto fonético internacional.
		</p>
	</section>

	<!-- Al final, como pide 05-PROTOCOLO §6. -->
	<section class="fuentes__seccion fuentes__seccion--desarrollo">
		<h2>Desarrollo</h2>
		<p>
			Piero Jacinto — <a href="https://github.com/PieroJacinto" rel="noreferrer"
				>github.com/PieroJacinto</a
			>
		</p>
		<p>
			Desarrollo independiente, sin fines de lucro. El código es abierto y las decisiones —incluido
			el algoritmo de búsqueda y qué se muestra de cada palabra— están documentadas y pueden
			auditarse.
		</p>
		<p>
			Si alguna organización lickanantay considera que algo de esta aplicación no corresponde
			publicarse, se retira sin condiciones.
		</p>
	</section>
</AppViewLayout>
