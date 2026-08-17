import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import { DESCRIPCION_NIVEL, ETIQUETA_NIVEL } from '$lib/domain/evidencia';
import type { NivelEvidencia } from '$lib/domain/tipos';

import Bienvenida from './Bienvenida.svelte';

const NIVELES: NivelEvidencia[] = ['atestiguada', 'unificada', 'reconstruida', 'propuesta'];

const marcado = () => render(Bienvenida, { props: { onEjemplo: () => {} } }).body;

describe('Bienvenida — qué es esto', () => {
	it('nombra la lengua y al pueblo', () => {
		const html = marcado();

		expect(html).toContain('ckunsa');
		expect(html).toContain('lickanantay');
	});

	/** D1: se dice "lengua dormida", nunca "extinta". */
	it('dice lengua dormida y no extinta', () => {
		const html = marcado();

		expect(html).toContain('dormida');
		expect(html).not.toContain('extinta');
	});

	/**
	 * Las fuentes no coinciden en cuándo murieron los últimos hablantes: 1890,
	 * 1896 y 1954 declararon la lengua extinta, y en 2022 Torrico-Ávila escribe
	 * que murieron en los noventa. La app no elige una fecha.
	 */
	it('no afirma una fecha exacta de los últimos hablantes', () => {
		const html = marcado();

		expect(html).not.toContain('años 50');
		expect(html).toContain('más de un siglo');
	});

	it('explica por qué cada palabra lleva su fuente', () => {
		expect(marcado()).toContain('de dónde sale');
	});
});

describe('Bienvenida — ejemplos', () => {
	/**
	 * Tocables y no decorativos: tocar "cueva" y ver dos fichas enseña más rápido
	 * que un párrafo. Cada uno muestra algo distinto del diccionario.
	 */
	it('ofrece ejemplos como botones', () => {
		const html = marcado();

		expect(html).toContain('cueva');
		expect(html).toContain('luna');
		expect(html).toContain('cabur');
	});

	it('explica qué muestra cada ejemplo', () => {
		expect(marcado()).toContain('dos palabras distintas');
	});

	it('son botones, no enlaces', () => {
		expect(marcado()).toContain('type="button"');
	});
});

describe('Bienvenida — leyenda de niveles', () => {
	/**
	 * Es lo más específico del proyecto y lo que nadie entiende solo: sin la
	 * leyenda, los colores del badge son decoración.
	 */
	it('lista los cuatro niveles con su marca', () => {
		const html = marcado();

		for (const nivel of NIVELES) {
			expect(html).toContain(`evidencia__marca--${nivel}`);
		}
	});

	it('escribe la palabra de cada nivel', () => {
		const html = marcado();

		for (const nivel of NIVELES) {
			expect(html).toContain(ETIQUETA_NIVEL[nivel]);
		}
	});

	it('explica cada uno en lenguaje llano', () => {
		const html = marcado();

		for (const nivel of NIVELES) {
			expect(html).toContain(DESCRIPCION_NIVEL[nivel]);
		}
	});

	/** En la leyenda el badge va solo: no hay ninguna forma que mostrar. */
	it('los badges de la leyenda no llevan forma', () => {
		expect(marcado()).not.toContain('evidencia__forma');
	});
});

describe('Bienvenida — salida', () => {
	it('enlaza a las fuentes', () => {
		expect(marcado()).toContain('href="/fuentes"');
	});
});
