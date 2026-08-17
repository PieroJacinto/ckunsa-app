<!--
	Qué es este proyecto, cómo se construyó y qué le falta.

	El tono es deliberado: un investigador quiere saber si puede confiar en los
	datos, un docente si sirve en el aula, y alguien de la comunidad quién hizo
	esto y con qué intención. Los tres necesitan lo mismo, que es honestidad
	sobre los límites. Una página que sólo contara lo que funciona no le serviría
	a ninguno.
-->
<script lang="ts">
	import AppViewLayout from '$lib/componentes/AppViewLayout.svelte';
</script>

<AppViewLayout titulo="El proyecto" subtitulo="Cómo está hecho y qué le falta">
	<article class="texto">
		<p class="texto__entrada">
			Un diccionario ckunsa que funciona sin conexión, se instala en el teléfono y muestra de dónde
			sale cada palabra. Son 851 entradas tomadas de fuentes publicadas con licencia abierta.
		</p>

		<h2>Qué no es</h2>

		<p>
			<strong>No es un diccionario oficial.</strong> No tiene el aval del Consejo Lingüístico Ckunsa Lickanantay
			ni de ninguna organización lickanantay. Es un desarrollo independiente hecho con material ya publicado.
			Las organizaciones del territorio aparecen en la página de fuentes como referencia, no como colaboradoras.
		</p>

		<p>
			<strong>No es un traductor.</strong> No genera oraciones ni conjuga verbos. La documentación existente
			no alcanza para eso, y fabricar formas inventadas es el peor daño posible a una lengua dormida.
		</p>

		<p>
			<strong>No reemplaza a nadie.</strong> Ya existe trabajo de revitalización en el territorio, hecho
			por gente lickanantay, desde mucho antes que esta aplicación.
		</p>

		<h2>La regla que ordena todo</h2>

		<p>
			En una lengua sin hablantes, todo lo que se sabe viene de papeles. Es muy fácil que una forma
			inventada empiece a circular como si fuera un dato: alguien la copia, otro la repite, y en dos
			generaciones es parte de la lengua.
		</p>

		<p class="texto__destacado">
			Por eso ninguna palabra se muestra sin decir qué respaldo tiene. Un chico que copia una
			palabra en el cuaderno tiene que poder saber si está documentada o si es una reconstrucción.
		</p>

		<p>
			Los cuatro niveles —atestiguada, unificada, reconstruida, propuesta— aparecen siempre con
			color, ícono y palabra escrita. Las tres cosas juntas, porque el color solo no sirve para
			quien no distingue colores, y una etiqueta que nadie entiende no informa.
		</p>

		<h2>De dónde salen los datos</h2>

		<p>
			De la digitalización del diccionario kunza de Roberto Lehnert publicada en el
			<em>Intercontinental Dictionary Series</em> del Instituto Max Planck, bajo licencia CC BY 4.0. Las
			glosas en español vienen de Concepticon, el catálogo de conceptos del mismo instituto.
		</p>

		<p>
			El proceso de conversión es código abierto y está testeado: se puede auditar de dónde salió
			cada carácter. Los archivos originales no se editan nunca; toda transformación queda
			registrada.
		</p>

		<h2>Tres decisiones que quizá sorprendan</h2>

		<p>
			<strong>Palabras distintas quedan como fichas distintas.</strong> Las fuentes están
			organizadas por concepto, no por palabra, y agrupar por concepto afirmaría que dos palabras
			son la misma. Buscar «cueva» devuelve <em>toco</em> y <em>ckoiba</em> por separado, porque la fuente
			no dice que sean lo mismo — de hecho anota que la segunda es probablemente préstamo del castellano.
		</p>

		<p>
			<strong>El índice se ordena por el español.</strong> En ckunsa, <em>ck</em>, <em>tch</em> y
			<em>tt</em> son letras propias, y en qué orden van lo define el Grafemario del Consejo, que todavía
			no pudimos consultar. El propio glosario del Consejo ordena por el español, así que esta aplicación
			hace lo mismo.
		</p>

		<p>
			<strong>Nada se borra.</strong> Si una forma resulta incorrecta, queda marcada con el motivo en
			vez de desaparecer. Que alguien la haya registrado alguna vez también es información sobre la lengua,
			y hay materiales impresos donde esa forma sigue circulando.
		</p>

		<h2>Qué falta</h2>

		<p>
			<strong>El Grafemario Unificado Ckunsa (2018).</strong> Sin él, las palabras siguen escritas
			en la grafía de sus fuentes y no en la oficial. Es lo que más falta.
			<a href="/grafia">Acá está el detalle</a> de qué se sabe hoy sobre la escritura y de dónde sale.
		</p>

		<p>
			<strong>El Diccionario Unificado Ckunsa</strong> y el corpus morfofonológico de Llanquiman, Hasler
			y Torrico-Ávila, que tiene 1.728 formas con transcripción fonética y análisis morfológico. Su repositorio
			no declara licencia, así que no se puede publicar sin autorización.
		</p>

		<p>
			<strong>Audio.</strong> Si algún día lo hay, tiene que ser de educadores tradicionales reales, con
			nombre y permiso. Nunca voz sintética: sin hablantes, la pronunciación es reconstrucción especulativa.
		</p>

		<h2>Quién lo hizo</h2>

		<p>
			Piero Jacinto. Desarrollo independiente, sin fines de lucro. El código es abierto y está en
			<a href="https://github.com/PieroJacinto/ckunsa-app" rel="noreferrer">GitHub</a>.
		</p>

		<p>
			<strong
				>Si alguna organización lickanantay considera que algo de esta aplicación no corresponde
				publicarse, se retira sin condiciones.</strong
			>
		</p>

		<p>
			<a href="/lengua">Sobre la lengua ckunsa</a> ·
			<a href="/fuentes">Fuentes y licencias</a>
		</p>
	</article>
</AppViewLayout>
