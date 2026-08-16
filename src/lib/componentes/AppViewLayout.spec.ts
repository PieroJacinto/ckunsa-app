import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import AppViewLayout from './AppViewLayout.svelte';

const snippet = (texto: string) => createRawSnippet(() => ({ render: () => `<p>${texto}</p>` }));

const renderizar = (props: Record<string, unknown> = {}) =>
	render(AppViewLayout, {
		props: { titulo: 'Buscar', children: snippet('cuerpo de la página'), ...props }
	});

describe('AppViewLayout — encabezado', () => {
	it('muestra el título', () => {
		expect(renderizar().body).toContain('Buscar');
	});

	it('lo pone también en el head, para la pestaña del navegador', () => {
		expect(renderizar().head).toContain('Buscar');
	});

	it('el subtítulo es opcional', () => {
		expect(renderizar().body).not.toContain('vista__subtitulo');
		expect(renderizar({ subtitulo: '851 palabras' }).body).toContain('851 palabras');
	});

	it('las acciones son opcionales', () => {
		expect(renderizar().body).not.toContain('vista__acciones');
		expect(renderizar({ acciones: snippet('un botón') }).body).toContain('un botón');
	});
});

describe('AppViewLayout — contenido', () => {
	it('renderiza lo que le pasan', () => {
		expect(renderizar().body).toContain('cuerpo de la página');
	});

	it('lo envuelve en un main semántico', () => {
		expect(renderizar().body).toContain('<main');
	});
});

describe('AppViewLayout — accesibilidad', () => {
	/**
	 * Sin el salto, quien navega con teclado tiene que atravesar el encabezado en
	 * cada página antes de llegar a los resultados.
	 */
	it('ofrece saltar al contenido', () => {
		const html = renderizar().body;

		expect(html).toContain('Saltar al contenido');
		expect(html).toContain('href="#contenido"');
	});

	it('el destino del salto existe', () => {
		expect(renderizar().body).toContain('id="contenido"');
	});

	it('usa header y footer semánticos, no divs sueltos', () => {
		const html = renderizar().body;

		expect(html).toContain('<header');
		expect(html).toContain('<footer');
	});

	it('hay un solo h1 por página', () => {
		const html = renderizar().body;

		expect(html.split('<h1').length - 1).toBe(1);
	});
});

describe('AppViewLayout — protocolo comunitario', () => {
	/**
	 * `05-PROTOCOLO` §6 pide la línea explícita de a quién pertenece la lengua.
	 * Está en el layout para que no falte en ninguna pantalla.
	 */
	it('el pie dice que la lengua es del pueblo lickanantay', () => {
		expect(renderizar().body).toContain('lickanantay');
	});

	it('el pie enlaza a fuentes y créditos', () => {
		expect(renderizar().body).toContain('href="/fuentes"');
	});
});
