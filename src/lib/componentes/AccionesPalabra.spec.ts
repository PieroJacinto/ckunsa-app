import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import AccionesPalabra from './AccionesPalabra.svelte';

const marcado = () =>
	render(AccionesPalabra, {
		props: {
			forma: 'ckabur',
			significado: 'montaña, loma',
			url: 'https://ckunsa-app.pages.dev/palabra/ckabur-montana'
		}
	}).body;

describe('AccionesPalabra', () => {
	it('ofrece copiar la palabra', () => {
		expect(marcado()).toContain('Copiar palabra');
	});

	/**
	 * `navigator.share` sólo existe en algunos navegadores y se detecta en
	 * onMount. En el render de servidor no hay navigator, así que se muestra la
	 * alternativa: nunca un botón que no va a funcionar.
	 */
	it('sin navigator.share ofrece copiar el enlace', () => {
		const html = marcado();

		expect(html).toContain('Copiar enlace');
		expect(html).not.toContain('>Compartir<');
	});

	it('son botones de tipo button, no submits', () => {
		expect(marcado()).toContain('type="button"');
	});

	/** El resultado se anuncia, no sólo se ve. */
	it('tiene una región viva para el aviso', () => {
		const html = marcado();

		expect(html).toContain('aria-live="polite"');
		expect(html).toContain('role="status"');
	});

	it('la región viva existe vacía desde el principio', () => {
		expect(marcado()).toContain('class="acciones__aviso"');
	});
});
