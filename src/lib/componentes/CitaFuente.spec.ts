import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import type { Fuente } from '$lib/domain/tipos';

import CitaFuente from './CitaFuente.svelte';

const LEHNERT: Fuente = {
	id: 'ids-lehnert-2021',
	cita:
		'Lehnert Santander, R. (2021). Kunza Dictionary. En Key, M. R. & Comrie, B. (eds.), ' +
		'The Intercontinental Dictionary Series. Leipzig: MPI-EVA.',
	cita_corta: 'Lehnert (2021)',
	anio: 2021,
	tipo: 'primaria',
	licencia: 'CC BY 4.0',
	url: 'https://ids.clld.org/contributions/308',
	autoridad_normativa: false
};

const marcado = (props: Record<string, unknown> = {}) =>
	render(CitaFuente, { props: { fuente: LEHNERT, ...props } }).body;

describe('CitaFuente — formato completo', () => {
	it('es el formato por defecto', () => {
		expect(marcado()).toContain('Kunza Dictionary');
	});

	it('muestra la cita bibliográfica entera', () => {
		expect(marcado({ formato: 'completa' })).toContain('Intercontinental Dictionary Series');
	});

	/** La licencia es parte del TASL: sin ella la atribución está incompleta. */
	it('nombra la licencia', () => {
		expect(marcado()).toContain('CC BY 4.0');
	});

	it('enlaza a la fuente original', () => {
		expect(marcado()).toContain('https://ids.clld.org/contributions/308');
	});

	it('lleva el id como ancla, para que el enlace compacto tenga destino', () => {
		expect(marcado()).toContain('id="ids-lehnert-2021"');
	});

	it('funciona sin url', () => {
		const sinUrl: Fuente = { ...LEHNERT, url: undefined };
		const html = render(CitaFuente, { props: { fuente: sinUrl } }).body;

		expect(html).toContain('CC BY 4.0');
	});
});

describe('CitaFuente — formato compacto', () => {
	/**
	 * CC BY exige atribución "reasonable to the medium". En una lista de 50
	 * resultados la cita completa taparía las palabras, así que se abrevia — pero
	 * SIEMPRE enlazando al dato completo, que es lo que lo vuelve admisible.
	 */
	it('muestra la forma abreviada', () => {
		expect(marcado({ formato: 'compacta' })).toContain('Lehnert (2021)');
	});

	it('no repite la cita entera', () => {
		expect(marcado({ formato: 'compacta' })).not.toContain('Intercontinental Dictionary Series');
	});

	it('SIEMPRE es un enlace al dato completo', () => {
		const html = marcado({ formato: 'compacta' });

		expect(html).toContain('<a');
		expect(html).toContain('/fuentes#ids-lehnert-2021');
	});
});

describe('CitaFuente — la atribución nunca desaparece', () => {
	/**
	 * El test que protege la obligación legal: en cualquier formato, el usuario
	 * tiene que poder saber de dónde salió el dato.
	 */
	it('los dos formatos identifican la fuente', () => {
		for (const formato of ['compacta', 'completa'] as const) {
			const html = marcado({ formato });

			expect(html.includes('Lehnert') || html.includes('ids-lehnert-2021')).toBe(true);
		}
	});
});