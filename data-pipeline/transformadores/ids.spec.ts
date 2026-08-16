import { describe, expect, it } from 'vitest';

import {
	FUENTE_CONCEPTICON,
	FUENTE_IDS,
	ID_FUENTE_IDS,
	idsIdDeFila,
	slug,
	transformarIds,
	type FilaConcepto,
	type FilaIds
} from './ids';

/**
 * Las filas de estos tests son REALES: copiadas verbatim de
 * `fuentes-crudas/ids-kunza-lehnert.tsv` y de
 * `fuentes-crudas/concepticon-Key-2016-1310.tsv`.
 *
 * Inventar filas de fixture haría que los tests validen mi idea de cómo son los
 * datos en vez de cómo son. Regla 13 del proyecto.
 */

const CONCEPTOS: FilaConcepto[] = [
	{
		IDS_ID: '1-220',
		ENGLISH: 'mountain, hill',
		SPANISH: 'montaña, loma',
		CONCEPTICON_ID: '2118',
		CONCEPTICON_GLOSS: 'MOUNTAIN OR HILL',
		CHAPTER: '1'
	},
	{
		IDS_ID: '1-280',
		ENGLISH: 'cave',
		SPANISH: 'cueva',
		CONCEPTICON_ID: '1155',
		CONCEPTICON_GLOSS: 'CAVE',
		CHAPTER: '1'
	},
	{
		IDS_ID: '1-530',
		ENGLISH: 'moon',
		SPANISH: 'luna',
		CONCEPTICON_ID: '1313',
		CONCEPTICON_GLOSS: 'MOON',
		CHAPTER: '1'
	},
	{
		IDS_ID: '4-392',
		ENGLISH: 'wing',
		SPANISH: 'ala',
		CONCEPTICON_ID: '1257',
		CONCEPTICON_GLOSS: 'WING',
		CHAPTER: '4'
	},
	{
		IDS_ID: '4-393',
		ENGLISH: 'feather',
		SPANISH: 'pluma',
		CONCEPTICON_ID: '1201',
		CONCEPTICON_GLOSS: 'FEATHER',
		CHAPTER: '4'
	},
	{
		IDS_ID: '14-710',
		ENGLISH: 'month',
		SPANISH: 'mes',
		CONCEPTICON_ID: '1370',
		CONCEPTICON_GLOSS: 'MONTH',
		CHAPTER: '14'
	}
];

const FILAS: FilaIds[] = [
	{
		id_ids: '308-1-220-1',
		forma: 'ckabur',
		valor_original: 'ckabur; caur',
		concepto_en: 'mountain, hill',
		concepticon_gloss: 'MOUNTAIN OR HILL',
		concepticon_id: '2118',
		capitulo_id: '1',
		capitulo: 'El mundo físico',
		comentario: 'Also cabur; cahur; kaur.'
	},
	{
		id_ids: '308-1-220-2',
		forma: 'caur',
		valor_original: 'ckabur; caur',
		concepto_en: 'mountain, hill',
		concepticon_gloss: 'MOUNTAIN OR HILL',
		concepticon_id: '2118',
		capitulo_id: '1',
		capitulo: 'El mundo físico',
		comentario: 'Also cabur; cahur; kaur.'
	},
	{
		id_ids: '308-1-280-1',
		forma: 'toco',
		valor_original: 'toco; [ckoiba]',
		concepto_en: 'cave',
		concepticon_gloss: 'CAVE',
		concepticon_id: '1155',
		capitulo_id: '1',
		capitulo: 'El mundo físico',
		comentario: "The latter, prob. loanword from Span. 'cueva'. Cf. 'hole' 12.850."
	},
	{
		id_ids: '308-1-280-2',
		forma: 'ckoiba',
		valor_original: 'toco; [ckoiba]',
		concepto_en: 'cave',
		concepticon_gloss: 'CAVE',
		concepticon_id: '1155',
		capitulo_id: '1',
		capitulo: 'El mundo físico',
		comentario: "The latter, prob. loanword from Span. 'cueva'. Cf. 'hole' 12.850."
	},
	{
		id_ids: '308-1-530-1',
		forma: 'ckamur',
		valor_original: 'ckamur; cáhmor',
		concepto_en: 'moon',
		concepticon_gloss: 'MOON',
		concepticon_id: '1313',
		capitulo_id: '1',
		capitulo: 'El mundo físico',
		comentario: "Also jamur; camur. Also mean 'month' 14.710."
	},
	{
		id_ids: '308-4-392-1',
		forma: 'ack-iu',
		valor_original: 'ack-iu',
		concepto_en: 'wing',
		concepticon_gloss: 'WING',
		concepticon_id: '1257',
		capitulo_id: '4',
		capitulo: 'El cuerpo',
		comentario: "Also means 'feather' 04.393."
	},
	{
		id_ids: '308-4-393-1',
		forma: 'ack-iu',
		valor_original: 'ack-iu; hackiu; hackeu',
		concepto_en: 'feather',
		concepticon_gloss: 'FEATHER',
		concepticon_id: '1201',
		capitulo_id: '4',
		capitulo: 'El cuerpo',
		comentario: "The first form also means 'wing' 04.392."
	},
	{
		id_ids: '308-14-710-1',
		forma: 'ckamur',
		valor_original: 'ckamur; ca-mur; cca-mur',
		concepto_en: 'month',
		concepticon_gloss: 'MONTH',
		concepticon_id: '1370',
		capitulo_id: '14',
		capitulo: 'Tiempo',
		comentario: "Also means 'moon' 01.530."
	}
];

const porId = (id: string) => {
	const { entradas } = transformarIds(FILAS, CONCEPTOS);
	const entrada = entradas.find((e) => e.id === id);
	if (!entrada) throw new Error(`No se generó la entrada "${id}". Generadas: ${entradas.map((e) => e.id).join(', ')}`);
	return entrada;
};

describe('helpers', () => {
	it('idsIdDeFila extrae capítulo y número', () => {
		expect(idsIdDeFila('308-1-210-1')).toBe('1-210');
		expect(idsIdDeFila('308-14-710-1')).toBe('14-710');
	});

	it('idsIdDeFila falla ruidosamente con un id malformado', () => {
		expect(() => idsIdDeFila('308')).toThrow();
	});

	it('slug conserva los guiones de la fuente', () => {
		expect(slug('ack-iu')).toBe('ack-iu');
		expect(slug('montaña')).toBe('montana');
	});
});

describe('transformarIds — granularidad (D12)', () => {
	/**
	 * EL TEST CENTRAL. IDS es onomasiológico: agrupa formas bajo un concepto sin
	 * afirmar que sean la misma palabra. `toco` y `ckoiba` comparten 'cave' pero
	 * el propio comentario de Lehnert dice que la segunda es préstamo del
	 * castellano. Fusionarlas inventaría un dato lingüístico.
	 */
	it('formas distintas del mismo concepto son entradas distintas', () => {
		const toco = porId('toco-cueva');
		const ckoiba = porId('ckoiba-cueva');

		expect(toco.id).not.toBe(ckoiba.id);
		expect(toco.significados).toEqual(['cueva']);
		expect(ckoiba.significados).toEqual(['cueva']);
	});

	it('no mete las formas hermanas en variantes_historicas', () => {
		const toco = porId('toco-cueva');
		const formasDeclaradas = (toco.variantes_historicas ?? []).map((v) => v.forma);

		expect(formasDeclaradas).not.toContain('ckoiba');
	});

	/**
	 * La contracara: la MISMA forma registrada para dos conceptos es una sola
	 * entrada con dos significados. Eso es colexificación y reportarla es
	 * factual: la fuente registra `ckamur` para 'moon' y para 'month'.
	 */
	it('la misma forma en varios conceptos es UNA entrada con varios significados', () => {
		const { entradas } = transformarIds(FILAS, CONCEPTOS);
		const ckamur = entradas.filter((e) => e.forma_clck === 'ckamur');

		expect(ckamur).toHaveLength(1);
		expect(ckamur[0]?.significados).toEqual(['luna', 'mes']);
	});

	it('genera una entrada por forma única', () => {
		const { entradas } = transformarIds(FILAS, CONCEPTOS);
		const formas = new Set(FILAS.map((f) => f.forma));

		expect(entradas).toHaveLength(formas.size);
	});
});

describe('transformarIds — significados', () => {
	it('separa las glosas españolas unidas por coma', () => {
		expect(porId('ckabur-montana').significados).toEqual(['montaña', 'loma']);
	});

	it('no deja significados vacíos ni duplicados', () => {
		const { entradas } = transformarIds(FILAS, CONCEPTOS);

		for (const e of entradas) {
			expect(e.significados.length).toBeGreaterThan(0);
			expect(new Set(e.significados).size).toBe(e.significados.length);
		}
	});

	it('falla ruidosamente si falta la glosa en español', () => {
		const sinGlosa: FilaConcepto[] = CONCEPTOS.map((c) =>
			c.IDS_ID === '1-280' ? { ...c, SPANISH: '' } : c
		);

		expect(() => transformarIds(FILAS, sinGlosa)).toThrow(/glosa en español/i);
	});
});

describe('transformarIds — campos de evidencia y procedencia', () => {
	it('marca todas las entradas como atestiguadas con la fuente IDS', () => {
		const { entradas } = transformarIds(FILAS, CONCEPTOS);

		for (const e of entradas) {
			expect(e.nivel_evidencia).toBe('atestiguada');
			expect(e.fuentes).toEqual([ID_FUENTE_IDS]);
		}
	});

	/**
	 * La grafía de Lehnert usa `c`, `k` y guiones, que no existen en el
	 * inventario CLCK. Sin esta marca la app estaría afirmando que esa es la
	 * grafía unificada. Eje distinto de nivel_evidencia (03 §2.4).
	 */
	it('marca la grafía como provisional en todas', () => {
		const { entradas } = transformarIds(FILAS, CONCEPTOS);

		for (const e of entradas) {
			expect(e.grafia_provisional).toBe(true);
		}
	});

	it('no inventa categoría gramatical ni estructura', () => {
		const { entradas } = transformarIds(FILAS, CONCEPTOS);

		for (const e of entradas) {
			expect(e.categoria).toBe('desconocida');
			expect(e.estructura).toBe('pendiente');
		}
	});

	it('preserva el id_ids y el concepticon_id para poder devolver correcciones', () => {
		const ckamur = porId('ckamur-luna');
		const externos = ckamur.identificadores_externos ?? [];

		expect(externos).toContainEqual({ esquema: 'ids', valor: '308-1-530-1' });
		expect(externos).toContainEqual({ esquema: 'ids', valor: '308-14-710-1' });
		expect(externos).toContainEqual({ esquema: 'concepticon', valor: '1313' });
	});

	it('guarda la forma de Lehnert como variante histórica con su fuente', () => {
		expect(porId('ckabur-montana').variantes_historicas).toEqual([
			{ forma: 'ckabur', fuente: ID_FUENTE_IDS }
		]);
	});
});

describe('transformarIds — comentarios de Lehnert', () => {
	/**
	 * El "Also X; Y; Z" NO es la lista de variantes del autor: significa "también
	 * registrado para este concepto" y mezcla variantes con palabras distintas.
	 * Se preserva como texto y no se parsea nunca.
	 */
	it('preserva el comentario verbatim en observaciones', () => {
		expect(porId('ckabur-montana').observaciones).toBe('Also cabur; cahur; kaur.');
	});

	it('no parsea el "Also" a datos estructurados', () => {
		const ckabur = porId('ckabur-montana');
		const formasDeclaradas = (ckabur.variantes_historicas ?? []).map((v) => v.forma);

		for (const mencionada of ['cabur', 'cahur', 'kaur']) {
			expect(formasDeclaradas).not.toContain(mencionada);
		}
	});

	it('no repite el mismo comentario cuando viene en varias filas', () => {
		const ackiu = porId('ack-iu-ala');

		expect(ackiu.observaciones).toBe(
			"Also means 'feather' 04.393. | The first form also means 'wing' 04.392."
		);
	});
});

describe('transformarIds — claves de búsqueda', () => {
	it('deriva las dos claves, sin guiones', () => {
		const ackiu = porId('ack-iu-ala');

		expect(ackiu.forma_clck).toBe('ack-iu');
		expect(ackiu.clave_canonica).toBe('ackiu');
		expect(ackiu.clave_historica.length).toBeGreaterThan(0);
	});
});

describe('transformarIds — determinismo', () => {
	/**
	 * El pipeline tiene que ser idempotente: correrlo dos veces da lo mismo. Si
	 * no, los ids bailan entre corridas y dejan de ser estables.
	 */
	it('dos corridas dan el mismo resultado', () => {
		expect(transformarIds(FILAS, CONCEPTOS)).toEqual(transformarIds(FILAS, CONCEPTOS));
	});

	it('el orden de las filas de entrada no cambia la salida', () => {
		const alReves = [...FILAS].reverse();

		expect(transformarIds(alReves, CONCEPTOS)).toEqual(transformarIds(FILAS, CONCEPTOS));
	});

	/**
	 * Atrapa el bug de ordenar los id_ids como texto: `308-14-710` iría antes
	 * que `308-1-530` y el campo semántico de `ckamur` sería "Tiempo" en vez de
	 * "El mundo físico".
	 */
	it('ordena los id_ids numéricamente, no como texto', () => {
		expect(porId('ckamur-luna').campo_semantico).toBe('El mundo físico');
		expect(porId('ckamur-luna').significados[0]).toBe('luna');
	});

	it('falla ruidosamente si dos formas generan el mismo id', () => {
		const colision: FilaIds[] = [
			{ ...FILAS[0]!, id_ids: '308-1-220-1', forma: 'se ma' },
			{ ...FILAS[0]!, id_ids: '308-1-220-2', forma: 'se-ma' }
		];

		expect(() => transformarIds(colision, CONCEPTOS)).toThrow(/id duplicado/i);
	});

	it('ignora las filas sin forma', () => {
		const conVacia: FilaIds[] = [...FILAS, { ...FILAS[0]!, id_ids: '308-1-220-9', forma: '  ' }];

		expect(transformarIds(conVacia, CONCEPTOS).entradas).toHaveLength(
			transformarIds(FILAS, CONCEPTOS).entradas.length
		);
	});
});

describe('transformarIds — fuentes', () => {
	it('declara IDS como primaria y Concepticon como catálogo', () => {
		const { fuentes } = transformarIds(FILAS, CONCEPTOS);

		expect(fuentes).toContainEqual(FUENTE_IDS);
		expect(fuentes).toContainEqual(FUENTE_CONCEPTICON);
		expect(FUENTE_IDS.tipo).toBe('primaria');
		expect(FUENTE_CONCEPTICON.tipo).toBe('catalogo');
	});

	it('las dos fuentes declaran licencia', () => {
		const { fuentes } = transformarIds(FILAS, CONCEPTOS);

		for (const f of fuentes) {
			expect(f.licencia).toBe('CC BY 4.0');
		}
	});
});