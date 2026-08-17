/**
 * Provee el diccionario a todo el árbol de componentes.
 *
 * POR QUÉ contexto y no una instancia exportada de módulo: los servidores son
 * de larga vida y se comparten entre usuarios, así que el estado por usuario no
 * puede vivir en una variable de módulo. La solución canónica de SvelteKit es
 * adjuntarlo al árbol de componentes con `setContext`, lo que lo acota a una
 * sola petición. Es lo que el propio framework hace con `page.data`.
 *
 * En esta app no hay datos privados —el corpus es el mismo para todos— pero el
 * patrón igual corresponde: sin él, dos usuarios que peguen al mismo proceso
 * compartirían la consulta de búsqueda.
 *
 * Beneficio adicional: una sola instancia por sesión significa que el corpus se
 * descarga y se indexa UNA vez, no en cada ruta.
 */

import { getContext, setContext } from 'svelte';

import { crearDiccionario, type Diccionario } from './diccionario.svelte';

/** Symbol y no string: no puede colisionar con otra clave de contexto. */
const CLAVE = Symbol('diccionario');

/**
 * Se llama UNA vez, en el layout raíz.
 *
 * @param instancia  Inyectable para tests. En producción se crea una nueva.
 */
export function proveerDiccionario(instancia: Diccionario = crearDiccionario()): Diccionario {
	setContext(CLAVE, instancia);
	return instancia;
}

/**
 * Lo pide cualquier componente del árbol.
 *
 * Falla ruidosamente si no hay ninguno: un `undefined` silencioso se
 * manifestaría mucho después como una pantalla vacía sin explicación.
 */
export function usarDiccionario(): Diccionario {
	const instancia = getContext<Diccionario | undefined>(CLAVE);

	if (!instancia) {
		throw new Error(
			'No hay diccionario en el contexto. Falta llamar a proveerDiccionario() en +layout.svelte.'
		);
	}

	return instancia;
}
