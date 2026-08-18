import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import PestanasSeccion from './PestanasSeccion.svelte';

const PESTANAS = [
	{ href: '/lengua', texto: 'La lengua' },
	{ href: '/grafia', texto: 'La escritura' }
];

const marcado = (rutaActual: string) =>
	render(PestanasSeccion, {
		props: { pestanas: PESTANAS, rutaActual, etiqueta: 'Secciones sobre la lengua' }
	}).body;

describe('PestanasSeccion', () => {
	it('lista las pestañas', () => {
		const html = marcado('/lengua');

		expect(html).toContain('La lengua');
		expect(html).toContain('La escritura');
	});

	it('marca la actual, y una sola', () => {
		const marcas = marcado('/lengua').match(/aria-current="page"/g) ?? [];

		expect(marcas).toHaveLength(1);
	});

	/** Enlaces y no botones: cada sección tiene URL propia y compartible. */
	it('son enlaces reales', () => {
		expect(marcado('/lengua')).toContain('href="/grafia"');
	});

	/** Etiqueta propia: si no, un lector de pantalla anuncia dos «navegación». */
	it('lleva etiqueta accesible propia', () => {
		expect(marcado('/lengua')).toContain('aria-label="Secciones sobre la lengua"');
	});
	it('marca la pestaña aunque la ruta lleve barra final', () => {
		expect(marcado('/grafia/')).toContain('href="/grafia" aria-current="page"');
	});
});
