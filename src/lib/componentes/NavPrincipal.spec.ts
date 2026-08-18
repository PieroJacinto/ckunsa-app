import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import NavPrincipal from './NavPrincipal.svelte';

const marcado = (rutaActual: string) => render(NavPrincipal, { props: { rutaActual } }).body;

describe('NavPrincipal', () => {
	it('lista las secciones', () => {
		const html = marcado('/');

		expect(html).toContain('Buscar');
		expect(html).toContain('Fuentes');
	});

	/**
	 * Seis: en móvil el nav es una barra de pestañas de 60 px por ítem, y una
	 * pestaña de más rompe las etiquetas. Si alguien agrega una séptima, este
	 * test falla y obliga a decidirlo a conciencia.
	 */
	it('tiene cinco secciones', () => {
		const enlaces = marcado('/').match(/class="vista__nav-enlace"/g) ?? [];

		expect(enlaces).toHaveLength(5);
	});

	it('es un nav con etiqueta accesible', () => {
		expect(marcado('/')).toContain('aria-label="Principal"');
	});
});

describe('NavPrincipal — página actual', () => {
	/** aria-current es lo que anuncia el lector de pantalla; el color no basta. */
	it('marca la ruta actual', () => {
		expect(marcado('/')).toContain('aria-current="page"');
	});

	it('marca una sola', () => {
		const marcas = marcado('/').match(/aria-current="page"/g) ?? [];

		expect(marcas).toHaveLength(1);
	});

	it('marca la de fuentes cuando corresponde', () => {
		const html = marcado('/fuentes');

		expect(html).toContain('href="/fuentes" aria-current="page"');
	});

	/** En la ficha de palabra ninguna sección del nav es la actual. */
	it('en una ruta que no está en el nav, no marca ninguna', () => {
		expect(marcado('/palabra/ckabur-montana')).not.toContain('aria-current="page"');
	});
});
