<!--
	La escritura del ckunsa: qué se sabe, de dónde, y qué falta.

	Existe porque es la pregunta que más condiciona esta aplicación. Está escrita
	para que un investigador vea las fuentes y un educador entienda el estado de
	la cuestión sin leer una tesis.

	TODO lo de acá sale de fuentes citables. La sistematización de los documentos
	del CLCK proviene de Llanquiman (2023), tesis de magíster en acceso abierto
	en el repositorio de la Universidad de Chile. Se pudo consultar el manual de trabajo de 2016 del Consejo (vía Scribd, ver
	`04-DATOS-Y-FUENTES`), pero NO el Grafemario Unificado de 2018 ni el
	Diccionario Unificado de 2021. La página lo dice explícitamente.
-->
<script lang="ts">
	import AppViewLayout from '$lib/componentes/AppViewLayout.svelte';
	import { page } from '$app/state';
	import PestanasSeccion from '$lib/componentes/PestanasSeccion.svelte';

	const PESTANAS = [
		{ href: '/lengua', texto: 'La lengua' },
		{ href: '/grafia', texto: 'La escritura' }
	];
</script>

<AppViewLayout titulo="La escritura del ckunsa" subtitulo="Qué está definido y qué no">
	<PestanasSeccion
		pestanas={PESTANAS}
		rutaActual={page.url.pathname}
		etiqueta="Secciones sobre la lengua"
	/>
	<article class="texto">
		<p class="texto__entrada">
			Esta es la pregunta que más condiciona la aplicación: <strong
				>¿cómo se escribe correctamente el ckunsa?</strong
			> La respuesta existe, la definió la comunidad, y este proyecto todavía no la tiene completa. Esta
			página explica exactamente qué se sabe y de dónde.
		</p>

		<h2>Tres inventarios, no uno</h2>

		<p>
			El Consejo Lingüístico Ckunsa Lickanantay publicó dos documentos normativos: el
			<strong>Grafemario Unificado</strong> (2018) y el <strong>Diccionario Unificado</strong>
			(2021). No dicen exactamente lo mismo.
		</p>

		<ul>
			<li>El <strong>Grafemario de 2018</strong> define 14 consonantes y 10 vocales.</li>
			<li>
				El <strong>Diccionario de 2021</strong> define 17 consonantes: agrega las oclusivas
				aspiradas <code translate="no" lang="kuz">th</code> y
				<code translate="no" lang="kuz">ph</code>, y la africada
				<code translate="no" lang="kuz">ts</code>.
			</li>
			<li>
				Una tercera propuesta, la de <strong>Llanquiman (2023)</strong>, suma
				<code translate="no" lang="kuz">tck</code> y <code translate="no" lang="kuz">ch</code>, y
				sugiere no usar <code translate="no" lang="kuz">ts</code>.
			</li>
		</ul>

		<p>
			Este proyecto pudo consultar un documento más: el <em
				>Grafemario Unificado — Manual de trabajo para cultores y educadores tradicionales</em
			>, del Consejo Lingüístico CKunsa Lickanantay, cerrado en enero de 2017. Fue elaborado por
			Ilia Reyes Aymani, Rubén Reyes Aymani, Juan Siares Flores, Wenceslao Reyes Chinchilla y Tomás
			Vilca Vilca, con patrocinio de CONADI.
		</p>

		<p>
			<strong>Ese documento no es la norma, y él mismo lo aclara:</strong> dice que «un Grafemario definitivo
			de la lengua CKunsa está en gestación» y que lo que presenta es un manual de trabajo. Declara además
			que en 2016 no fue posible validarlo con los educadores tradicionales ni con las comunidades. Por
			eso esta aplicación no lo usa para normalizar nada.
		</p>

		<h2>Las letras del ckunsa</h2>

		<p><strong>Vocales.</strong> Cinco breves y cinco largas, que se escriben duplicadas:</p>

		<p class="texto__formas">a · e · i · o · u · aa · ee · ii · oo · uu</p>

		<p>
			<strong>Consonantes</strong>, según la propuesta de 2023:
		</p>

		<p class="texto__formas">
			b · ck · tck · ch · tch · h · l · m · n · p · ph · pp · r · s · t · th · tt · y
		</p>

		<p>
			Varios de esos son <strong>una sola letra aunque se escriban con dos o tres signos</strong>:
			<code translate="no" lang="kuz">ck</code>, <code translate="no" lang="kuz">tch</code> y
			<code translate="no" lang="kuz">tck</code>
			no son «c más k» ni «t más ch». Es la misma lógica de la <em>ch</em> y la <em>ll</em> del castellano
			antes de 1994.
		</p>

		<h2>Reglas que el Consejo sí definió</h2>

		<p>
			<strong
				><code translate="no" lang="kuz">c</code>, <code translate="no" lang="kuz">k</code> y
				<code translate="no" lang="kuz">ck</code>
				se escriben todas
				<code translate="no" lang="kuz">ck</code>.</strong
			> Es una norma del Diccionario Unificado.
		</p>

		<p>
			<strong
				>La <code translate="no" lang="kuz">z</code> se reemplaza por
				<code translate="no" lang="kuz">s</code>.</strong
			>
			El Consejo lo argumenta explícitamente: el sonido de la z habría llegado con los españoles, no es
			propio de las lenguas andinas prehispánicas, y en los registros
			<em translate="no" lang="kuz">ckunza</em> era la única palabra que la usaba.
		</p>

		<p>
			<strong
				>No se usan <code translate="no" lang="kuz">d</code>,
				<code translate="no" lang="kuz">f</code>, <code translate="no" lang="kuz">g</code>,
				<code translate="no" lang="kuz">j</code>,
				<code translate="no" lang="kuz">v</code>, <code translate="no" lang="kuz">w</code> ni
				<code translate="no" lang="kuz">x</code>.</strong
			> En eso coinciden los dos documentos.
		</p>

		<p>
			<strong>Las vocales largas cambian el significado.</strong> No son un error de tipeo:
			<em translate="no" lang="kuz">ckapin</em> es 'día' y
			<em translate="no" lang="kuz">ckaapin</em>
			es 'sol'; <em translate="no" lang="kuz">ckari</em> es 'nuevo' y
			<em translate="no" lang="kuz">ckaari</em> es 'brote'. Hay 22 pares así en el corpus del Consejo.
		</p>

		<p>
			<strong
				><code translate="no" lang="kuz">tt</code> y <code translate="no" lang="kuz">pp</code> son sonidos
				propios</strong
			>, no letras repetidas: son oclusivas eyectivas, que se pronuncian con un golpe de glotis. En
			cambio
			<code translate="no" lang="kuz">mm</code>, <code translate="no" lang="kuz">nn</code> y
			<code translate="no" lang="kuz">ss</code> sí son dos consonantes seguidas.
		</p>

		<h2>Por qué esto le importa a un buscador</h2>

		<p>
			Porque decide qué palabras son la misma y cuáles no. Esta aplicación distingue
			<em translate="no" lang="kuz">patha</em> 'gracias' de <em translate="no" lang="kuz">patta</em>
			'madre', y no las trata como variantes de escritura. La razón es que
			<code translate="no" lang="kuz">th</code>
			y <code translate="no" lang="kuz">tt</code> representan sonidos distintos —una aspirada y una eyectiva—
			según el propio Diccionario del Consejo.
		</p>

		<p>
			Lo mismo con <em translate="no" lang="kuz">ckotcho</em> 'mazamorra' y
			<em translate="no" lang="kuz">ckotcko</em>
			'cráneo', o con
			<em translate="no" lang="kuz">atitur</em> 'vencer' y
			<em translate="no" lang="kuz">hatitur</em> 'entrar'. Un buscador que ignorara esas diferencias fusionaría
			palabras que no tienen nada que ver.
		</p>

		<h2>Lo que falta</h2>

		<p>
			<strong>Las reglas de acentuación, casi.</strong> El Grafemario de 2018 dice que el acento
			tiende a la esdrújula. Llanquiman lo analiza y propone que el ckunsa tiene acento fijo y
			predecible, que cae hacia la izquierda de la palabra: en la penúltima sílaba si tiene dos, en
			la antepenúltima si tiene tres, y en la última si tiene cuatro o cinco —como
			<em translate="no" lang="kuz">lickanantay</em>—. Los compuestos conservan el acento de sus
			raíces.
		</p>

		<p>
			De ahí sale la respuesta a algo que este buscador necesitaba saber. En el corpus hay 56 formas
			con tilde, y la tesis explica de dónde vienen: <strong
				>son marcas de acento que anotaron San Román en 1890 y Mostny en 1954, y que el Consejo
				conservó</strong
			>. Describen dónde cae el acento; no distinguen una palabra de otra. Por eso esta aplicación
			las ignora al buscar, y <em translate="no" lang="kuz">humar</em> encuentra también
			<em translate="no" lang="kuz">húmar</em>.
		</p>

		<p>
			Queda una salvedad: en el manual de 2016 los propios investigadores anotaron que «se discute
			sobre la pertinencia del acento en el ckunsa». Estaba abierto. Lo de arriba es una inferencia
			bien fundada sobre una tesis, no una decisión del Consejo.
		</p>

		<p>
			<strong>Los documentos originales.</strong> Todo lo de esta página viene de una sistematización
			académica de tercera mano. Para afirmar «esta aplicación usa la grafía oficial» hace falta el Grafemario
			del Consejo, que no está publicado como dataset ni como PDF accesible.
		</p>

		<h2>Qué hace la aplicación mientras tanto</h2>

		<p>
			<strong>No convierte nada.</strong> Las palabras se muestran tal como las escribió cada fuente,
			marcadas como «grafía de la fuente, pendiente de normalización».
		</p>

		<p>
			Podríamos aplicar las reglas de arriba y convertir buena parte del corpus. No lo hacemos
			porque el resultado no sería «grafía CLCK»: sería nuestra interpretación de una tesis sobre
			los documentos del CLCK. La diferencia importa cuando alguien copia una palabra en un
			cuaderno.
		</p>

		<p class="texto__destacado">
			La normalización se hará cuando el Consejo confirme las reglas, y quedará documentada como una
			transformación reversible.
		</p>

		<h2>Fuentes de esta página</h2>

		<p>
			Llanquiman Iturrieta, E. (2023). <em
				>Planificación lingüística formal lickanantay: perfil fonológico-grafémico de la lengua
				ckunsa</em
			>. Tesis de magíster, Universidad de Chile. Enmarcada en el proyecto Fondecyt 11220225 (ANID),
			dirigido por Elizabeth Torrico-Ávila.
			<a href="https://repositorio.uchile.cl/handle/2250/202162" rel="noreferrer"
				>Repositorio de la Universidad de Chile</a
			>
		</p>

		<p>
			Consejo Lingüístico CKunsa Lickanantay (2017). <em
				>Grafemario Unificado: manual de trabajo para cultores y educadores tradicionales</em
			>. San Pedro de Atacama, patrocinio CONADI. Documento previo al Grafemario Unificado de 2018,
			que este proyecto no pudo consultar.
		</p>

		<p>
			<a href="/lengua">Sobre la lengua ckunsa</a> ·
			<a href="/proyecto">Sobre este proyecto</a>
		</p>
	</article>
</AppViewLayout>
