/**
 * Índice del diccionario: recorrer el léxico sin buscar.
 *
 * Un buscador sirve cuando ya sabés qué buscar. Un índice sirve para explorar,
 * que es lo que hace alguien que está aprendiendo.
 *
 * POR QUÉ SE ORDENA POR LA GLOSA EN ESPAÑOL Y NO POR LA FORMA CKUNSA.
 *
 * En la grafía CLCK, `ck`, `tch`, `tck`, `th`, `tt`, `ph`, `pp` y `ts` son
 * grafemas propios, no secuencias de letras. Ordenar `ckabur` bajo la C sería
 * aplicarle al ckunsa el alfabeto del castellano; y ordenarlo bien exigiría
 * saber en qué posición va cada dígrafo, que es justamente lo que define el
 * *Grafemario Unificado Ckunsa* — bloqueante B1, todavía sin conseguir.
 * Inventar ese orden violaría la regla 6.
 *
 * La salida no la decidimos nosotros: el Consejo Lingüístico Ckunsa publica su
 * propio "Glosario Alfabético" en lenguackunsa.cl, y está ordenado **por la
 * glosa en español**, no por la forma ckunsa. Esta implementación sigue esa
 * práctica.
 *
 * Además es lo que sirve al usuario real: quien explora una lengua dormida casi
 * siempre parte del español, porque no sabe todavía la palabra en ckunsa.
 */

import { normalizarSignificado } from './busqueda';
import type { Corpus, Entrada } from './tipos';

/** Una línea del índice: una glosa apuntando a una forma. */
export interface LineaIndice {
	glosa: string;
	entrada: Entrada;
}

export interface GrupoAlfabetico {
	letra: string;
	lineas: LineaIndice[];
}

export interface GrupoSemantico {
	campo: string;
	entradas: Entrada[];
}

/** Grupo para glosas que no empiezan con letra. Hoy queda vacío. */
export const SIN_LETRA = '#';

/** Saca la puntuación inicial: `¿dónde?` va en la D, no en un cajón aparte. */
function clave(glosa: string): string {
	return normalizarSignificado(glosa).replace(/^[^a-z0-9]+/, '');
}

export function letraDe(glosa: string): string {
	const primera = clave(glosa).charAt(0).toUpperCase();
	return /^[A-Z]$/.test(primera) ? primera : SIN_LETRA;
}

/**
 * Agrupa por letra inicial de la glosa española.
 *
 * Una entrada con varios significados aparece VARIAS veces, una por glosa:
 * `ckamur` está en la L de "luna" y en la M de "mes". Es lo correcto en un
 * índice: quien busca "mes" tiene que encontrarlo ahí. El glosario del CLCK
 * hace lo mismo.
 *
 * Las entradas retiradas no aparecen (`03-MODELO-DE-DATOS` §5).
 */
export function construirIndiceAlfabetico(corpus: Corpus): GrupoAlfabetico[] {
	const porLetra = new Map<string, LineaIndice[]>();

	for (const entrada of corpus.entradas) {
		if (entrada.estado === 'retirada') continue;

		for (const glosa of entrada.significados) {
			const letra = letraDe(glosa);
			const lineas = porLetra.get(letra);

			if (lineas) lineas.push({ glosa, entrada });
			else porLetra.set(letra, [{ glosa, entrada }]);
		}
	}

	const grupos: GrupoAlfabetico[] = [...porLetra.entries()].map(([letra, lineas]) => ({
		letra,
		lineas: lineas.sort(
			(a, b) =>
				clave(a.glosa).localeCompare(clave(b.glosa), 'es') ||
				a.entrada.forma_clck.localeCompare(b.entrada.forma_clck, 'es')
		)
	}));

	return grupos.sort((a, b) => {
		if (a.letra === SIN_LETRA) return 1;
		if (b.letra === SIN_LETRA) return -1;
		return a.letra.localeCompare(b.letra, 'es');
	});
}

/**
 * Agrupa por campo semántico.
 *
 * OJO con la atribución: estos campos son los 22 capítulos del cuestionario
 * IDS, adaptados de Buck (1949). **No** son las categorías del CLCK, que tiene
 * las suyas propias en su Atlas de la lengua —Familia, La lickana, Toponimia y
 * apellidos locales, Medicina tradicional— y reflejan otras prioridades. La UI
 * tiene que decir de dónde salen.
 */
export function agruparPorCampoSemantico(corpus: Corpus): GrupoSemantico[] {
	const porCampo = new Map<string, Entrada[]>();

	for (const entrada of corpus.entradas) {
		if (entrada.estado === 'retirada') continue;

		const campo = entrada.campo_semantico;
		if (!campo) continue;

		const lista = porCampo.get(campo);
		if (lista) lista.push(entrada);
		else porCampo.set(campo, [entrada]);
	}

	return [...porCampo.entries()]
		.map(([campo, entradas]) => ({
			campo,
			entradas: entradas.sort((a, b) => a.forma_clck.localeCompare(b.forma_clck, 'es'))
		}))
		.sort((a, b) => a.campo.localeCompare(b.campo, 'es'));
}
