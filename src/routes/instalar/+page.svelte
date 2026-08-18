<!--
	Cómo instalar la aplicación.

	Página propia y no una sección adentro de otra, por una razón práctica: tiene
	URL, y una URL se puede mandar por mensaje. Es el caso real —alguien no puede
	instalarla y hay que explicarle— y resolverlo con un enlace es mejor que
	escribir los pasos en un chat.

	Acá viven TODAS las instrucciones. El botón de la portada enlaza a esta
	página en vez de repetirlas: una sola fuente de verdad.
-->
<script lang="ts">
	import AppViewLayout from '$lib/componentes/AppViewLayout.svelte';
</script>

<AppViewLayout titulo="Instalar el diccionario" subtitulo="En el teléfono o la computadora">
	<article class="texto">
		<p class="texto__destacado">
			No hace falta instalarlo. En el navegador funciona igual, también sin conexión. Instalarlo
			sólo agrega el ícono en la pantalla y lo abre sin la barra de direcciones.
		</p>

		<h2>En Android</h2>

		<p>
			<strong>Con Chrome:</strong> abrí el menú de tres puntos, arriba a la derecha, y elegí «Instalar
			aplicación». También suele aparecer un botón en la propia página de inicio del diccionario.
		</p>

		<p>
			<strong>Con el navegador de Samsung:</strong> abrí el menú, abajo a la derecha, elegí «Agregar página
			a» y después «Pantalla de inicio».
		</p>

		<h2>En iPhone o iPad</h2>

		<p>
			Tiene que ser con <strong>Safari</strong>. Tocá el botón de compartir —abajo en el medio de la
			pantalla—, deslizá hacia abajo y elegí «Agregar a pantalla de inicio». Confirmá con «Agregar».
		</p>

		<h2>En una computadora</h2>

		<p>
			Buscá el ícono de instalar a la derecha de la barra de direcciones, o entrá al menú del
			navegador y elegí «Instalar». Funciona en Chrome, Edge y otros navegadores basados en
			Chromium.
		</p>

		<h2>Si aparece un aviso de que la aplicación no es segura</h2>

		<p>
			Tocá <strong>«Más detalles»</strong> y después <strong>«Instalar de todos modos»</strong>.
		</p>

		<p>
			Es un aviso conocido de algunos navegadores de Android, no de esta aplicación. Cuando instalás
			una web como aplicación, el paquete que se instala lo genera el navegador, y Android bloquea
			los que apuntan a versiones viejas del sistema. Ese paquete no lo controla este proyecto.
		</p>

		<p>
			Si el aviso no te deja seguir, probá instalarla desde Chrome. Y si tampoco, usála en el
			navegador: funciona exactamente igual.
		</p>

		<h2>Cómo desinstalarla</h2>

		<p>
			En Android y iPhone, como cualquier aplicación: mantené apretado el ícono y elegí eliminar. En
			una computadora, abrí la aplicación instalada y usá el menú de tres puntos de su ventana.
		</p>

		<p>
			<a href="/">Volver al diccionario</a>
		</p>
	</article>
</AppViewLayout>
