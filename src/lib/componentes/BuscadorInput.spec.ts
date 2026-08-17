import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import BuscadorInput from './BuscadorInput.svelte';

const marcado = (props: Record<string, unknown> = {}) =>
	render(BuscadorInput, { props: { valor: '', onBuscar: () => {}, ...props } }).body;

describe('BuscadorInput — etiquetado', () => {
	/**
	 * El placeholder no es una etiqueta: desaparece al escribir y tiene contraste
	 * insuficiente. Va un label real, aunque esté oculto visualmente.
	 */
	it('tiene un label asociado al input', () => {
		const html = marcado();

		expect(html).toContain('for="buscador-consulta"');
		expect(html).toContain('id="buscador-consulta"');
	});

	it('el label dice que la búsqueda es en los dos idiomas', () => {
		expect(marcado()).toContain('Buscar en ckunsa o en español');
	});

	it('la lupa es decorativa para el lector de pantalla', () => {
		expect(marcado()).toContain('aria-hidden="true"');
	});
});

describe('BuscadorInput — es controlado', () => {
	it('refleja el valor que recibe', () => {
		expect(marcado({ valor: 'ckabur' })).toContain('ckabur');
	});

	it('acepta un placeholder propio', () => {
		expect(marcado({ placeholder: 'probá con tama' })).toContain('probá con tama');
	});
});

describe('BuscadorInput — botón de limpiar', () => {
	it('no aparece con el campo vacío', () => {
		expect(marcado()).not.toContain('Limpiar la búsqueda');
	});

	it('aparece cuando hay algo escrito', () => {
		expect(marcado({ valor: 'ckabur' })).toContain('Limpiar la búsqueda');
	});

	/**
	 * Texto oculto adentro del botón, no sólo aria-label: se traduce y funciona
	 * con control por voz.
	 */
	it('tiene nombre accesible como texto, no sólo como atributo', () => {
		const html = marcado({ valor: 'x' });

		expect(html).toContain('visualmente-oculto');
		expect(html).toContain('>Limpiar la búsqueda<');
	});

	it('el title lo hace descubrible con el mouse', () => {
		expect(marcado({ valor: 'x' })).toContain('title="Limpiar la búsqueda"');
	});

	it('es un button de tipo button, no un submit', () => {
		expect(marcado({ valor: 'x' })).toContain('type="button"');
	});
});

describe('BuscadorInput — anuncio de resultados', () => {
	/**
	 * Los lectores de pantalla anuncian cambios DENTRO de una región viva, no la
	 * aparición de la región. Por eso se renderiza siempre, aunque vacía.
	 */
	it('la región viva existe aunque no haya nada que anunciar', () => {
		const html = marcado();

		expect(html).toContain('aria-live="polite"');
		expect(html).toContain('role="status"');
	});

	it('no anuncia nada con el campo vacío', () => {
		expect(marcado({ cantidadResultados: 5 })).not.toContain('5 resultados');
	});

	it('anuncia el plural', () => {
		expect(marcado({ valor: 'a', cantidadResultados: 3 })).toContain('3 resultados');
	});

	it('anuncia el singular sin pluralizar mal', () => {
		const html = marcado({ valor: 'a', cantidadResultados: 1 });

		expect(html).toContain('1 resultado');
		expect(html).not.toContain('1 resultados');
	});

	it('anuncia cuando no hay nada', () => {
		expect(marcado({ valor: 'zzz', cantidadResultados: 0 })).toContain('Sin resultados');
	});
});
