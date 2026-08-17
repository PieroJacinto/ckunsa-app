<!--
	Qué es el ckunsa, para quien llega sin contexto.

	Habla de la LENGUA y de su documentación, que es sobre lo que este proyecto
	tiene algo que decir. No narra la historia, la cultura ni la cosmovisión del
	pueblo lickanantay: eso no nos corresponde escribirlo (`05-PROTOCOLO` §1).

	Escrita en capas: el cuerpo en lenguaje llano, y los datos que un
	investigador necesita —años, autores, obras— integrados en el texto donde
	corresponde, sin notas al pie. Un docente los saltea sin que le estorben.
-->
<script lang="ts">
	import AppViewLayout from '$lib/componentes/AppViewLayout.svelte';
</script>

<AppViewLayout titulo="La lengua ckunsa" subtitulo="Qué se sabe y de dónde">
	<article class="texto">
		<p class="texto__entrada">
			El <strong>ckunsa</strong> es la lengua del pueblo lickanantay, del Salar de Atacama y de
			zonas del noroeste argentino y el suroeste de Bolivia. No se parece a ninguna otra lengua
			conocida: es lo que los lingüistas llaman una <em>lengua aislada</em>. Tuvo contacto largo con
			el quechua y el aimara, y de ahí tomó préstamos, pero no desciende de ellas.
		</p>

		<h2>Lengua dormida, no extinta</h2>

		<p>
			La palabra importa. «Lengua dormida» se usa para lenguas sin hablantes conocidos pero con un
			proceso comunitario de recuperación activo. Las comunidades atacameñas rechazan «extinta»:
			desde adentro, el ckunsa está dormido y despertando.
		</p>

		<p>Y hay una razón más, que la historia de la documentación deja bien clara.</p>

		<h2>Todos la dieron por muerta, y siguió apareciendo</h2>

		<p>
			En <strong>1890</strong>, Francisco San Román advirtió que solo quedaban unos pocos ancianos y
			que cuando murieran no iba a quedar «el menor vestigio» de la lengua.
		</p>

		<p>
			En <strong>1896</strong>, Emilio Vaïsse, Félix Hoyos y Aníbal Echeverría publicaron el
			glosario más completo que existe —unas 1.100 palabras— y escribieron en la introducción que la
			lengua atacameña «ya pertenece a las lenguas estintas».
		</p>

		<p>
			En <strong>1954</strong>, Grete Mostny y su equipo declararon que llevaba unos sesenta años
			extinta. En el mismo trabajo <strong>grabaron canciones y conversaciones en ckunsa</strong>
			en Peine y Socaire.
		</p>

		<p>
			En <strong>2022</strong>, la lingüista Elizabeth Torrico-Ávila escribió que los últimos
			hablantes murieron en los años noventa. Y Tomás Vilca, que hoy enseña la lengua en el
			territorio, es nieto de una de esas últimas hablantes.
		</p>

		<p class="texto__destacado">
			Durante más de un siglo, cada generación de investigadores dio la lengua por perdida. Cada una
			encontró gente que todavía la hablaba.
		</p>

		<h2>De dónde viene lo que sabemos</h2>

		<p>
			Casi todo el registro del ckunsa lo hicieron viajeros, funcionarios y sacerdotes entre 1860 y
			1954, la mayoría sin formación lingüística, anotando lo que escuchaban con la ortografía del
			castellano, el francés o el alemán. Eso tiene una consecuencia incómoda: muchas de las
			reconstrucciones que se hacen hoy sobre cómo sonaba la lengua son interpretaciones que nadie
			puede comprobar.
		</p>

		<p>
			La excepción parcial es el trabajo de Mostny en Peine, que usó la convención fonética del
			Instituto de Etnografía de París y por eso es la base más sólida que existe.
		</p>

		<h2>Cinco maneras de escribir el mismo nombre</h2>

		<p>
			<em>cunza</em>, <em>kunza</em>, <em>cunsa</em>, <em>kunsa</em>, <em>ckunsa</em>. Las cinco
			circulan, y no son un capricho: cada una viene de una época y de una decisión distinta. Las
			primeras son de los registros del siglo XIX; <em>kunza</em> es la de Lehnert en los años 70 y
			80; <em>kunsa</em> aparece en el grafemario del Ministerio de Educación de 2014.
		</p>

		<p>
			<strong>La grafía que usa esta aplicación es <em>ckunsa</em></strong>, la que adoptó el
			Consejo Lingüístico Ckunsa Lickanantay en 2018 y ratificó la comunidad en el
			<em>Semmu Halayna Ckapur Lassi Ckunsa</em> —la Primera Gran Reunión de la Lengua— en octubre de
			2021. No es una decisión técnica: es una decisión del pueblo lickanantay sobre cómo se escribe su
			lengua.
		</p>

		<p>
			El nombre significa <strong>«nuestro»</strong>: viene de <em>kun</em> «nosotros» más el sufijo
			<em>-sa</em> de posesión.
		</p>

		<h2>Qué se sabe de su gramática</h2>

		<p>
			El ckunsa es <strong>aglutinante y sufijante</strong>: las palabras se arman pegando piezas al
			final de una raíz. El verbalizador <em>-tur</em> es el proceso mejor documentado — de
			<em>ampi</em> «medicina» sale <em>ampitur</em> «curar».
		</p>

		<p>
			El sistema de <strong>numerales</strong> es el subsistema más completo y regular que se
			conoce. Dos números yuxtapuestos se multiplican y unidos por la partícula <em>ta</em> se
			suman: <em>su-ci pala-ma</em> es 10 × 3 = 30, y <em>su-ci ta se-ma</em> es 10 + 1 = 11. Con
			una irregularidad que hay que respetar: el 20 es <em>su-ci ta su-ci</em>, diez más diez, y no
			diez por dos.
		</p>

		<p>
			<strong>Lo que no se sabe es mucho más.</strong> No se conoce el sistema verbal: no hay documentación
			suficiente de persona, tiempo ni aspecto. Tampoco el orden de la oración, la negación, la interrogación
			ni la subordinación. En todo el registro histórico hay alrededor de diez oraciones completas.
		</p>

		<p>
			Por eso esta aplicación es un diccionario y <strong>no un traductor</strong>. Traducir
			oraciones exigiría inventar la parte que falta, y una forma inventada que circula como si
			fuera documentada es, en una lengua dormida, un daño que no se corrige.
		</p>

		<h2>Quién la está despertando</h2>

		<p>
			Desde 2010, el <strong>Consejo Lingüístico Ckunsa Lickanantay</strong> lleva adelante la
			revitalización: capacitó educadores tradicionales, diseñó material educativo y publicó el
			<em>Grafemario Unificado Ckunsa</em> (2018) y el <em>Diccionario Unificado Ckunsa</em>.
		</p>

		<p>
			Ese trabajo tiene un contexto que conviene conocer: se hizo, en buena parte, para
			contrarrestar la decisión del Ministerio de Educación de enseñar solo quechua y aimara en
			territorio lickanantay. La bibliografía lo describe como una política lingüística
			<em>desde abajo</em> frente a una <em>desde arriba</em>.
		</p>

		<p>
			En los últimos años el proyecto <strong>Yockontur</strong> —«hablar» en ckunsa—, de la Corporación
			Cultural La Huella Teatro, con patrocinio del Consejo y apoyo de UNESCO, llevó diccionarios y talleres
			a las escuelas de Peine, Solor, Camar, Río Grande, San Pedro, Socaire, Talabre y Toconao.
		</p>

		<h2>Qué le falta a esta aplicación</h2>

		<p>
			Las palabras que ves están escritas en la grafía de sus fuentes, <strong>no</strong> en la
			grafía unificada del Consejo. Para convertirlas hace falta el
			<em>Grafemario Unificado Ckunsa</em>, que este proyecto todavía no pudo consultar.
			Convertirlas por parecido con el castellano sería inventar ortografía, y eso no se hace.
		</p>

		<p>
			<a href="/fuentes">Ver todas las fuentes y sus licencias</a>
		</p>
	</article>
</AppViewLayout>
