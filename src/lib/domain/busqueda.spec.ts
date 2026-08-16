import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
	LIMITE_RESULTADOS,
	buscar,
	buscarExacta,
	construirIndice,
	distancia,
	normalizarSignificado
} from './busqueda';
import { canonizar, historizar } from './normalizacion';
import type { Corpus, Entrada, Fuente } from './tipos';

// ---------------------------------------------------------------------------
// Corpus sintético — para probar el ranking de forma determinística
// ---------------------------------------------------------------------------

const FUENTE: Fuente = {
	id: 'f1',
	cita: 'Fuente de prueba',
	cita_corta: 'Prueba (2021)',
	anio: 2021,
	tipo: 'primaria',
	licencia: 'CC BY 4.0',
	autoridad_normativa: false
};

function entrada(cambios: Partial<Entrada> & { id: string; forma_clck: string }): Entrada {
	return {
		clave_canonica: canonizar(cambios.forma_clck),
		clave_historica: historizar(cambios.forma_clck),
		significados: ['significado'],
		categoria: 'desconocida',
		nivel_evidencia: 'atestiguada',
		fuentes: ['f1'],
		estructura: 'pendiente',
		estado: 'activa',
		...cambios
	};
}

const corpus = (entradas: Entrada[]): Corpus => ({
	version: 1,
	entradas,
	fuentes: [FUENTE],
	morfemas: []
});

const indiceDe = (entradas: Entrada[]) => construirIndice(corpus(entradas));

/** Formas devueltas, en orden. */
const formas = (resultados: { entrada: Entrada }[]) => resultados.map((r) => r.entrada.forma_clck);

describe('normalizarSignificado', () => {
	it('baja a minúsculas y saca acentos', () => {
		expect(normalizarSignificado('  Montaña ')).toBe('montana');
	});
});

describe('distancia — Levenshtein acotada', () => {
	it('cuenta las ediciones', () => {
		expect(distancia('puri', 'pury', 1)).toBe(1);
		expect(distancia('tama', 'tama', 1)).toBe(0);
	});

	it('corta apenas se pasa del máximo', () => {
		expect(distancia('kunza', 'ckunsa', 1)).toBeGreaterThan(1);
	});

	it('descarta por diferencia de largo sin calcular', () => {
		expect(distancia('a', 'abcdefgh', 2)).toBeGreaterThan(2);
	});
});

describe('construirIndice', () => {
	it('indexa por id, canónica, variante y significado', () => {
		const indice = indiceDe([
			entrada({
				id: 'a',
				forma_clck: 'ckabur',
				significados: ['montaña'],
				variantes_historicas: [{ forma: 'caur', fuente: 'f1' }]
			})
		]);

		expect(indice.porId.get('a')?.forma_clck).toBe('ckabur');
		expect(indice.porCanonica.get('ckabur')).toEqual(['a']);
		expect(indice.porVariante.get('caur')).toEqual(['a']);
		expect(indice.porSignificado.get('montana')).toEqual(['a']);
	});

	it('indexa las retiradas también, para que buscarExacta las encuentre', () => {
		const indice = indiceDe([
			entrada({ id: 'a', forma_clck: 'tama', estado: 'retirada', motivo_retiro: 'x' })
		]);

		expect(indice.porId.size).toBe(1);
	});
});

describe('buscar — orden de ranking', () => {
	const datos = [
		entrada({ id: 'exacta', forma_clck: 'tama', significados: ['caliente'] }),
		entrada({ id: 'prefijo', forma_clck: 'tamara', significados: ['otra cosa'] }),
		entrada({ id: 'contiene', forma_clck: 'ttama', significados: ['algo'] }),
		entrada({
			id: 'porvariante',
			forma_clck: 'puri',
			significados: ['agua'],
			variantes_historicas: [{ forma: 'tama', fuente: 'f1' }]
		})
	];

	it('la exacta va primero', () => {
		const resultados = buscar(indiceDe(datos), 'tama');

		expect(resultados[0]?.entrada.id).toBe('exacta');
		expect(resultados[0]?.motivo).toBe('exacta');
	});

	it('la variante declarada va antes que el prefijo', () => {
		const resultados = buscar(indiceDe(datos), 'tama');
		const ids = resultados.map((r) => r.entrada.id);

		expect(ids.indexOf('porvariante')).toBeLessThan(ids.indexOf('prefijo'));
	});

	it('no repite una entrada que coincide por varias vías', () => {
		const resultados = buscar(indiceDe(datos), 'tama');
		const ids = resultados.map((r) => r.entrada.id);

		expect(new Set(ids).size).toBe(ids.length);
	});

	it('encuentra por significado en español', () => {
		const resultados = buscar(indiceDe(datos), 'caliente');

		expect(resultados[0]?.entrada.id).toBe('exacta');
		expect(resultados[0]?.motivo).toBe('espanol');
	});
});

describe('buscar — bidireccional, sin selector de idioma', () => {
	const datos = [
		entrada({ id: 'toco', forma_clck: 'toco', significados: ['cueva'] }),
		entrada({ id: 'ckoiba', forma_clck: 'ckoiba', significados: ['cueva'] })
	];

	/**
	 * D12: formas distintas del mismo concepto son entradas distintas, y las dos
	 * tienen que aparecer. Que el usuario vea las dos es el punto.
	 */
	it('un significado compartido devuelve las dos fichas', () => {
		expect(formas(buscar(indiceDe(datos), 'cueva')).sort()).toEqual(['ckoiba', 'toco']);
	});

	it('la misma consulta funciona en la otra dirección', () => {
		expect(formas(buscar(indiceDe(datos), 'toco'))).toContain('toco');
	});
});

describe('buscar — fallback de grafía histórica', () => {
	/**
	 * El caso que justifica el nivel tolerante, y el ejemplo canónico del
	 * proyecto: quien aprendió con material de los 80 escribe *kunza* y tiene que
	 * encontrar *ckunsa*.
	 *
	 * El ejemplo aísla este camino a propósito: `kunza` no es subcadena de
	 * `ckunsa` (así que no entra por "contiene") y está a distancia 2, fuera del
	 * alcance del fuzzy para consultas de 5 caracteres.
	 */
	it('encuentra por grafía histórica y lo marca aproximada', () => {
		const indice = indiceDe([
			entrada({ id: 'a', forma_clck: 'ckunsa', significados: ['nuestro'] })
		]);
		const resultados = buscar(indice, 'kunza');

		expect(resultados[0]?.entrada.id).toBe('a');
		expect(resultados[0]?.motivo).toBe('aproximada');
	});

	it('explica que la coincidencia fue por grafía histórica', () => {
		const indice = indiceDe([
			entrada({ id: 'a', forma_clck: 'ckunsa', significados: ['nuestro'] })
		]);

		expect(buscar(indice, 'kunza')[0]?.detalle).toContain('histórica');
	});

	/**
	 * `qu` es un DÍGRAFO que mapea a K, no dos letras sueltas: `quta` representa
	 * algo como /kta/ y no es una grafía histórica de `ckuta`. Queda fijado como
	 * test para que nadie "arregle" la regla pensando que es un bug.
	 */
	it('no confunde el dígrafo qu con la secuencia k + u', () => {
		const indice = indiceDe([entrada({ id: 'a', forma_clck: 'ckuta', significados: ['sal'] })]);

		expect(buscar(indice, 'quta')).toEqual([]);
	});

	/**
	 * El nivel tolerante fusiona pares mínimos, así que NO puede consultarse
	 * primero. Si `patha` está en el corpus, buscarla no puede devolver `patta`
	 * antes que ella.
	 */
	it('nunca antes que la exacta: patha no trae patta primero', () => {
		const indice = indiceDe([
			entrada({ id: 'gracias', forma_clck: 'patha', significados: ['gracias'] }),
			entrada({ id: 'madre', forma_clck: 'patta', significados: ['madre'] })
		]);

		expect(buscar(indice, 'patha')[0]?.entrada.id).toBe('gracias');
	});
});

describe('buscar — entradas retiradas', () => {
	const retirada = entrada({
		id: 'vieja',
		forma_clck: 'tama',
		significados: ['caliente'],
		estado: 'retirada',
		motivo_retiro: 'restricción comunitaria'
	});

	it('no aparecen en los resultados normales', () => {
		expect(buscar(indiceDe([retirada]), 'tama')).toEqual([]);
	});

	it('buscarExacta sí las devuelve, con su motivo', () => {
		const encontradas = buscarExacta(indiceDe([retirada]), 'tama');

		expect(encontradas[0]?.motivo_retiro).toBe('restricción comunitaria');
	});
});

describe('buscar — bordes', () => {
	const datos = [entrada({ id: 'a', forma_clck: 'tama', significados: ['caliente'] })];

	it('la consulta vacía no devuelve nada', () => {
		expect(buscar(indiceDe(datos), '   ')).toEqual([]);
	});

	it('una consulta sin coincidencias no devuelve nada', () => {
		expect(buscar(indiceDe(datos), 'xyzzy')).toEqual([]);
	});

	it('ignora mayúsculas y acentos de la consulta', () => {
		expect(formas(buscar(indiceDe(datos), 'TAMÁ'))).toContain('tama');
	});
});

// ---------------------------------------------------------------------------
// Corpus real — regla 13: validar contra los datos, no contra la intuición
// ---------------------------------------------------------------------------

describe('buscar — contra el corpus real de IDS', () => {
	const leer = <T>(archivo: string): T =>
		JSON.parse(
			readFileSync(new URL(`../../../static/data/${archivo}`, import.meta.url), 'utf-8')
		) as T;

	const real: Corpus = {
		version: 1,
		entradas: leer<Entrada[]>('entradas.v1.json'),
		fuentes: leer<Fuente[]>('fuentes.v1.json'),
		morfemas: []
	};

	const indice = construirIndice(real);

	it('el corpus publicado tiene 851 entradas', () => {
		expect(real.entradas).toHaveLength(851);
	});

	it('ckabur devuelve su ficha primero', () => {
		const resultados = buscar(indice, 'ckabur');

		expect(resultados[0]?.entrada.forma_clck).toBe('ckabur');
		expect(resultados[0]?.motivo).toBe('exacta');
	});

	it('un docente que busca "montaña" encuentra ckabur', () => {
		expect(formas(buscar(indice, 'montaña'))).toContain('ckabur');
	});

	/**
	 * El caso que da sentido a D12 con datos reales: `toco` y `ckoiba` comparten
	 * el concepto 'cueva' pero son palabras distintas, y las dos aparecen.
	 */
	it('"cueva" devuelve toco y ckoiba como dos fichas', () => {
		const encontradas = formas(buscar(indice, 'cueva'));

		expect(encontradas).toContain('toco');
		expect(encontradas).toContain('ckoiba');
	});

	/** Colexificación: ckamur está registrado para 'moon' y para 'month'. */
	it('"mes" y "luna" llevan las dos a ckamur', () => {
		expect(formas(buscar(indice, 'mes'))).toContain('ckamur');
		expect(formas(buscar(indice, 'luna'))).toContain('ckamur');
	});

	it('una grafía vieja como "cabur" llega a ckabur, marcada aproximada', () => {
		const resultados = buscar(indice, 'cabur');

		expect(resultados[0]?.entrada.forma_clck).toBe('ckabur');
		expect(resultados[0]?.motivo).toBe('aproximada');
	});

	it('respeta el límite de resultados con una consulta amplia', () => {
		expect(buscar(indice, 'a').length).toBeLessThanOrEqual(LIMITE_RESULTADOS);
	});

	it('nunca devuelve la misma entrada dos veces', () => {
		for (const consulta of ['a', 'ckabur', 'agua', 'tama', 'cabur']) {
			const ids = buscar(indice, consulta).map((r) => r.entrada.id);
			expect(new Set(ids).size).toBe(ids.length);
		}
	});

	it('toda coincidencia aproximada explica por qué coincidió', () => {
		for (const consulta of ['cabur', 'quta', 'pury']) {
			for (const r of buscar(indice, consulta)) {
				if (r.motivo === 'aproximada') expect(r.detalle).toBeTruthy();
			}
		}
	});
});
