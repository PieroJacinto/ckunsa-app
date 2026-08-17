import { describe, expect, it } from 'vitest';

import { canonizar, historizar } from './normalizacion';
import { SIN_LETRA, agruparPorCampoSemantico, construirIndiceAlfabetico, letraDe } from './indice';
import type { Corpus, Entrada } from './tipos';

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
	fuentes: [],
	morfemas: []
});

describe('letraDe', () => {
	it('toma la inicial de la glosa', () => {
		expect(letraDe('cueva')).toBe('C');
	});

	it('ignora los acentos', () => {
		expect(letraDe('árbol')).toBe('A');
	});

	/** `¿dónde?` va en la D, no en un cajón aparte. */
	it('ignora la puntuación inicial', () => {
		expect(letraDe('¿dónde?')).toBe('D');
		expect(letraDe('¡ay!')).toBe('A');
	});

	it('manda a SIN_LETRA lo que no empieza con letra ni número', () => {
		expect(letraDe('—')).toBe(SIN_LETRA);
	});
});

describe('construirIndiceAlfabetico', () => {
	const datos = [
		entrada({ id: 'toco', forma_clck: 'toco', significados: ['cueva'] }),
		entrada({ id: 'ckabur', forma_clck: 'ckabur', significados: ['montaña', 'loma'] }),
		entrada({ id: 'puri', forma_clck: 'puri', significados: ['agua'] })
	];

	it('agrupa por letra inicial de la glosa', () => {
		const grupos = construirIndiceAlfabetico(corpus(datos));

		expect(grupos.map((g) => g.letra)).toEqual(['A', 'C', 'L', 'M']);
	});

	/**
	 * La decisión central: el orden lo da el ESPAÑOL, no la forma ckunsa. Si se
	 * ordenara por forma, `ckabur` caería en la C y estaríamos afirmando que en
	 * ckunsa la `ck` va bajo la C — que es lo que define el Grafemario (B1).
	 */
	it('NO agrupa por la forma ckunsa', () => {
		const grupos = construirIndiceAlfabetico(corpus(datos));
		const grupoC = grupos.find((g) => g.letra === 'C');

		expect(grupoC?.lineas.map((l) => l.glosa)).toEqual(['cueva']);
		expect(grupoC?.lineas.map((l) => l.entrada.forma_clck)).not.toContain('ckabur');
	});

	/** Una entrada con dos glosas aparece en las dos letras. */
	it('una forma con varios significados aparece una vez por glosa', () => {
		const grupos = construirIndiceAlfabetico(corpus(datos));
		const enL = grupos.find((g) => g.letra === 'L')?.lineas ?? [];
		const enM = grupos.find((g) => g.letra === 'M')?.lineas ?? [];

		expect(enL[0]?.entrada.forma_clck).toBe('ckabur');
		expect(enM[0]?.entrada.forma_clck).toBe('ckabur');
	});

	it('cada línea conserva la glosa que la ubicó', () => {
		const grupos = construirIndiceAlfabetico(corpus(datos));

		expect(grupos.find((g) => g.letra === 'L')?.lineas[0]?.glosa).toBe('loma');
	});

	it('ordena las glosas dentro de cada letra', () => {
		const muchas = [
			entrada({ id: 'a', forma_clck: 'x', significados: ['cueva'] }),
			entrada({ id: 'b', forma_clck: 'y', significados: ['casa'] }),
			entrada({ id: 'c', forma_clck: 'z', significados: ['cerro'] })
		];
		const grupoC = construirIndiceAlfabetico(corpus(muchas))[0];

		expect(grupoC?.lineas.map((l) => l.glosa)).toEqual(['casa', 'cerro', 'cueva']);
	});

	it('deja SIN_LETRA al final', () => {
		const datosConSimbolo = [
			...datos,
			entrada({ id: 'raro', forma_clck: 'q', significados: ['—'] })
		];
		const grupos = construirIndiceAlfabetico(corpus(datosConSimbolo));

		expect(grupos[grupos.length - 1]?.letra).toBe(SIN_LETRA);
	});

	/** Las retiradas no se exploran: quien las busca las encuentra por búsqueda exacta. */
	it('no incluye las entradas retiradas', () => {
		const conRetirada = [
			entrada({
				id: 'vieja',
				forma_clck: 'x',
				significados: ['cueva'],
				estado: 'retirada',
				motivo_retiro: 'restricción comunitaria'
			})
		];

		expect(construirIndiceAlfabetico(corpus(conRetirada))).toEqual([]);
	});

	it('un corpus vacío no rompe nada', () => {
		expect(construirIndiceAlfabetico(corpus([]))).toEqual([]);
	});
});

describe('agruparPorCampoSemantico', () => {
	const datos = [
		entrada({ id: 'a', forma_clck: 'toco', campo_semantico: 'El mundo físico' }),
		entrada({ id: 'b', forma_clck: 'ckabur', campo_semantico: 'El mundo físico' }),
		entrada({ id: 'c', forma_clck: 'lacsi', campo_semantico: 'El cuerpo' }),
		entrada({ id: 'd', forma_clck: 'sinCampo' })
	];

	it('agrupa por campo', () => {
		const grupos = agruparPorCampoSemantico(corpus(datos));

		expect(grupos.map((g) => g.campo)).toEqual(['El cuerpo', 'El mundo físico']);
	});

	it('ordena las formas dentro de cada campo', () => {
		const grupos = agruparPorCampoSemantico(corpus(datos));
		const fisico = grupos.find((g) => g.campo === 'El mundo físico');

		expect(fisico?.entradas.map((e) => e.forma_clck)).toEqual(['ckabur', 'toco']);
	});

	it('omite las entradas sin campo semántico', () => {
		const grupos = agruparPorCampoSemantico(corpus(datos));
		const todas = grupos.flatMap((g) => g.entradas.map((e) => e.id));

		expect(todas).not.toContain('d');
	});

	it('no incluye las retiradas', () => {
		const conRetirada = [
			entrada({
				id: 'x',
				forma_clck: 'x',
				campo_semantico: 'El cuerpo',
				estado: 'retirada',
				motivo_retiro: 'motivo'
			})
		];

		expect(agruparPorCampoSemantico(corpus(conRetirada))).toEqual([]);
	});
});
