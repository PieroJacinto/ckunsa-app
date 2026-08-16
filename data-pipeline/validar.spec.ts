import { describe, expect, it } from 'vitest';

import { canonizar, historizar } from '../src/lib/domain/normalizacion.ts';
import type { Corpus, Entrada, Fuente, Morfema } from '../src/lib/domain/tipos.ts';
import { BASELINE_COLISIONES, grafemasAjenos, tieneTilde, validar } from './validar.ts';

const FUENTE: Fuente = {
	id: 'f1',
	cita: 'Fuente de prueba',
	anio: 2021,
	tipo: 'primaria',
	licencia: 'CC BY 4.0',
	autoridad_normativa: false
};

/** Entrada válida por defecto. Cada test rompe sólo lo que quiere probar. */
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

function morfema(cambios: Partial<Morfema> & { id: string }): Morfema {
	return {
		forma: '-ps',
		tipo: 'flexivo',
		funcion: 'adlativo',
		descripcion: 'hacia',
		posicion: 'sufijo',
		nivel_evidencia: 'atestiguada',
		fuentes: ['f1'],
		ejemplos: [],
		...cambios
	};
}

const corpus = (entradas: Entrada[], morfemas: Morfema[] = [], fuentes = [FUENTE]): Corpus => ({
	version: 1,
	entradas,
	fuentes,
	morfemas
});

/** Sólo los códigos de regla de los errores. Los avisos no rompen el build. */
const errores = (c: Corpus): string[] =>
	validar(c)
		.filter((p) => p.nivel === 'error')
		.map((p) => p.regla);

const avisos = (c: Corpus): string[] =>
	validar(c)
		.filter((p) => p.nivel === 'aviso')
		.map((p) => p.regla);

describe('helpers', () => {
	it('grafemasAjenos no marca nada en una forma del inventario', () => {
		expect(grafemasAjenos('ckabur')).toEqual([]);
	});

	it('grafemasAjenos ignora los guiones de la fuente', () => {
		expect(grafemasAjenos('pe-ter')).toEqual([]);
	});

	it('grafemasAjenos detecta la c sola, que no existe en CLCK', () => {
		expect(grafemasAjenos('caur')).toEqual(['c']);
	});

	it('tieneTilde distingue la forma acentuada de la que no', () => {
		expect(tieneTilde('ayián')).toBe(true);
		expect(tieneTilde('ayian')).toBe(false);
	});
});

describe('validar — corpus sano', () => {
	it('no reporta errores', () => {
		expect(errores(corpus([entrada({ id: 'tama-caliente', forma_clck: 'tama' })]))).toEqual([]);
	});
});

describe('validar — integridad referencial', () => {
	it('detecta ids duplicados', () => {
		const c = corpus([
			entrada({ id: 'repetido', forma_clck: 'tama' }),
			entrada({ id: 'repetido', forma_clck: 'puri' })
		]);

		expect(errores(c)).toContain('id-duplicado');
	});

	it('detecta una entrada sin fuente', () => {
		const c = corpus([entrada({ id: 'a', forma_clck: 'tama', fuentes: [] })]);

		expect(errores(c)).toContain('sin-fuente');
	});

	it('detecta una fuente que no existe', () => {
		const c = corpus([entrada({ id: 'a', forma_clck: 'tama', fuentes: ['inventada'] })]);

		expect(errores(c)).toContain('fuente-inexistente');
	});

	it('detecta una entrada sin significados', () => {
		const c = corpus([entrada({ id: 'a', forma_clck: 'tama', significados: [] })]);

		expect(errores(c)).toContain('sin-significados');
	});

	it('detecta una fuente sin licencia', () => {
		const c = corpus([entrada({ id: 'a', forma_clck: 'tama' })], [], [{ ...FUENTE, licencia: '' }]);

		expect(errores(c)).toContain('fuente-sin-licencia');
	});
});

describe('validar — claves derivadas', () => {
	/**
	 * Las claves las calcula el pipeline. Si no coinciden, o alguien las escribió
	 * a mano, o cambió el algoritmo sin regenerar los datos: en los dos casos la
	 * búsqueda dejaría de encontrar lo que debería.
	 */
	it('detecta una clave_canonica que no deriva de la forma', () => {
		const c = corpus([entrada({ id: 'a', forma_clck: 'tama', clave_canonica: 'otra-cosa' })]);

		expect(errores(c)).toContain('clave-canonica');
	});

	it('detecta una clave_historica que no deriva de la forma', () => {
		const c = corpus([entrada({ id: 'a', forma_clck: 'tama', clave_historica: 'otra-cosa' })]);

		expect(errores(c)).toContain('clave-historica');
	});
});

describe('validar — nunca se borra una entrada', () => {
	it('exige motivo cuando una entrada está retirada', () => {
		const c = corpus([entrada({ id: 'a', forma_clck: 'tama', estado: 'retirada' })]);

		expect(errores(c)).toContain('retiro-sin-motivo');
	});

	it('acepta la retirada con motivo', () => {
		const c = corpus([
			entrada({
				id: 'a',
				forma_clck: 'tama',
				estado: 'retirada',
				motivo_retiro: 'restricción comunitaria'
			})
		]);

		expect(errores(c)).toEqual([]);
	});
});

describe('validar — grafía (bloqueante B1)', () => {
	/**
	 * Si una forma usa grafemas que no existen en el inventario CLCK y no está
	 * marcada, la app está afirmando que esa es la ortografía unificada.
	 */
	it('rechaza un grafema ajeno sin marca de grafía provisional', () => {
		const c = corpus([entrada({ id: 'a', forma_clck: 'caur' })]);

		expect(errores(c)).toContain('grafema-ajeno');
	});

	it('lo acepta si está declarado como grafía de la fuente', () => {
		const c = corpus([entrada({ id: 'a', forma_clck: 'caur', grafia_provisional: true })]);

		expect(errores(c)).toEqual([]);
	});

	/**
	 * No hay reglas de acentuación documentadas. Una forma acentuada tiene que
	 * estar marcada de algún modo antes de mostrarse.
	 */
	it('rechaza una forma con tilde sin ninguna marca', () => {
		const c = corpus([entrada({ id: 'a', forma_clck: 'ayián' })]);

		expect(errores(c)).toContain('tilde-sin-nota');
	});

	it('acepta la tilde si la grafía es provisional', () => {
		const c = corpus([entrada({ id: 'a', forma_clck: 'ayián', grafia_provisional: true })]);

		expect(errores(c)).toEqual([]);
	});

	it('acepta la tilde si hay nota en observaciones', () => {
		const c = corpus([
			entrada({ id: 'a', forma_clck: 'ayián', observaciones: 'acento sin regla documentada' })
		]);

		expect(errores(c)).toEqual([]);
	});
});

describe('validar — baseline de colisiones', () => {
	const CONSONANTES_PRUEBA = ['p', 't', 'm', 'n', 'l', 's', 'r', 'h', 'b', 'y'];

	/**
	 * Genera N pares que colisionan por geminada vocálica (`pta` / `ptaa`), cada
	 * par con su propia clave. Es la misma colisión benigna que produce el corpus
	 * real con `ckaabar` / `ckabar`.
	 */
	function paresQueColisionan(cantidad: number): Entrada[] {
		const entradas: Entrada[] = [];
		let i = 0;

		for (const a of CONSONANTES_PRUEBA) {
			for (const b of CONSONANTES_PRUEBA) {
				if (i >= cantidad) break;
				entradas.push(entrada({ id: `corta${i}`, forma_clck: `${a}${b}a` }));
				entradas.push(entrada({ id: `larga${i}`, forma_clck: `${a}${b}aa` }));
				i++;
			}
		}

		return entradas;
	}

	it('acepta exactamente el baseline', () => {
		expect(errores(corpus(paresQueColisionan(BASELINE_COLISIONES)))).toEqual([]);
	});

	it('falla apenas se pasa del baseline', () => {
		expect(errores(corpus(paresQueColisionan(BASELINE_COLISIONES + 1)))).toContain(
			'colisiones-baseline'
		);
	});
});

describe('validar — morfemas', () => {
	it('detecta un morfema sin fuente', () => {
		const c = corpus([], [morfema({ id: 'm1', fuentes: [] })]);

		expect(errores(c)).toContain('sin-fuente');
	});

	it('detecta un morfema que referencia una fuente inexistente', () => {
		const c = corpus([], [morfema({ id: 'm1', fuentes: ['inventada'] })]);

		expect(errores(c)).toContain('fuente-inexistente');
	});

	it('detecta ids de morfema duplicados', () => {
		const c = corpus([], [morfema({ id: 'm1' }), morfema({ id: 'm1' })]);

		expect(errores(c)).toContain('id-duplicado');
	});
});

describe('validar — avisos', () => {
	/**
	 * Los avisos no rompen el build, pero dejan la deuda del Grafemario (B1) a la
	 * vista en cada corrida. Una deuda que no se ve deja de existir.
	 */
	it('avisa cuántas formas llevan tilde', () => {
		const c = corpus([entrada({ id: 'a', forma_clck: 'ayián', grafia_provisional: true })]);

		expect(avisos(c)).toContain('tildes-pendientes');
	});

	it('avisa cuántas entradas no están en grafía CLCK', () => {
		const c = corpus([entrada({ id: 'a', forma_clck: 'caur', grafia_provisional: true })]);

		expect(avisos(c)).toContain('grafia-provisional');
	});

	it('no avisa nada cuando el corpus está en grafía canónica y sin tildes', () => {
		expect(avisos(corpus([entrada({ id: 'a', forma_clck: 'tama' })]))).toEqual([]);
	});
});