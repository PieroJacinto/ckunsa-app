import { describe, expect, it } from 'vitest';

import {
	DESCRIPCION_NIVEL,
	ETIQUETA_NIVEL,
	ICONO_NIVEL,
	NOTA_GRAFIA_PROVISIONAL,
	requiereAdvertencia
} from './evidencia';
import type { NivelEvidencia } from './tipos';

/**
 * Los cuatro niveles, escritos a mano y no derivados de las tablas.
 *
 * Es a propósito: si alguien agrega un nivel al enum, este array queda corto y
 * los tests de exhaustividad fallan. Derivarlo con Object.keys haría que el
 * test se adapte solo y no atrape nada.
 */
const NIVELES: NivelEvidencia[] = ['atestiguada', 'unificada', 'reconstruida', 'propuesta'];

describe('cobertura de los cuatro niveles', () => {
	/**
	 * D7: el enum es cerrado. Ninguna forma puede llegar a la pantalla sin
	 * etiqueta, ícono y descripción — si falta uno, el badge quedaría mudo.
	 */
	it('los cuatro tienen etiqueta', () => {
		for (const nivel of NIVELES) {
			expect(ETIQUETA_NIVEL[nivel]).toBeTruthy();
		}
	});

	it('los cuatro tienen descripción', () => {
		for (const nivel of NIVELES) {
			expect(DESCRIPCION_NIVEL[nivel]).toBeTruthy();
		}
	});

	it('los cuatro tienen ícono', () => {
		for (const nivel of NIVELES) {
			expect(ICONO_NIVEL[nivel]).toBeTruthy();
		}
	});

	it('las tablas no tienen claves de más', () => {
		expect(Object.keys(ETIQUETA_NIVEL).sort()).toEqual([...NIVELES].sort());
		expect(Object.keys(DESCRIPCION_NIVEL).sort()).toEqual([...NIVELES].sort());
		expect(Object.keys(ICONO_NIVEL).sort()).toEqual([...NIVELES].sort());
	});
});

describe('las marcas se distinguen sin color', () => {
	/**
	 * WCAG 1.4.1: la información no puede depender sólo del color. Si dos niveles
	 * compartieran ícono Y etiqueta, un daltónico no podría diferenciarlos.
	 *
	 * `atestiguada` y `unificada` comparten color de fondo a propósito (las dos
	 * son sólidas), así que el ícono es lo único que las separa visualmente.
	 */
	it('cada nivel tiene un ícono distinto', () => {
		const iconos = NIVELES.map((n) => ICONO_NIVEL[n]);

		expect(new Set(iconos).size).toBe(NIVELES.length);
	});

	it('cada nivel tiene una etiqueta distinta', () => {
		const etiquetas = NIVELES.map((n) => ETIQUETA_NIVEL[n]);

		expect(new Set(etiquetas).size).toBe(NIVELES.length);
	});
});

describe('descripciones', () => {
	it('están en lenguaje llano, sin jerga de niveles', () => {
		for (const nivel of NIVELES) {
			const texto = DESCRIPCION_NIVEL[nivel];

			expect(texto.length).toBeGreaterThan(20);
			expect(texto.endsWith('.')).toBe(true);
		}
	});

	/** El destinatario es un chico de escuela: no puede leer "nivel_evidencia". */
	it('no filtran nombres de campos del modelo', () => {
		for (const nivel of NIVELES) {
			expect(DESCRIPCION_NIVEL[nivel]).not.toContain('nivel_evidencia');
			expect(DESCRIPCION_NIVEL[nivel]).not.toContain('forma_clck');
		}
	});
});

describe('requiereAdvertencia', () => {
	/**
	 * Lo documentado y lo unificado son registro; lo reconstruido y lo propuesto
	 * son análisis o acuerdo. La distinción es la que evita que una forma
	 * derivada circule como dato firme.
	 */
	it('no advierte sobre lo que está documentado', () => {
		expect(requiereAdvertencia('atestiguada')).toBe(false);
		expect(requiereAdvertencia('unificada')).toBe(false);
	});

	it('advierte sobre lo reconstruido y lo propuesto', () => {
		expect(requiereAdvertencia('reconstruida')).toBe(true);
		expect(requiereAdvertencia('propuesta')).toBe(true);
	});
});

describe('nota de grafía provisional', () => {
	/**
	 * Eje distinto del nivel de evidencia (`03` §2.4): mide en qué ortografía
	 * está escrita la forma, no de dónde sale el dato. En el MVP la llevan las
	 * 851 entradas de IDS.
	 */
	it('dice que la grafía es de la fuente y está pendiente', () => {
		expect(NOTA_GRAFIA_PROVISIONAL).toContain('fuente');
		expect(NOTA_GRAFIA_PROVISIONAL).toContain('pendiente');
	});
});
