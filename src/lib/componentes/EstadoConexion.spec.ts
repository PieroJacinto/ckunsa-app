import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import EstadoConexion from './EstadoConexion.svelte';

describe('EstadoConexion', () => {
	/**
	 * En el render de servidor no hay `navigator`, y el estado se calcula en
	 * onMount. Así que por defecto no muestra nada — que es lo correcto: un
	 * indicador permanente de "conectado" sería ruido en una app que no depende
	 * de estar conectada.
	 */
	it('no muestra nada mientras no se sepa que falta conexión', () => {
		const { body } = render(EstadoConexion);

		expect(body).not.toContain('Sin conexión');
	});
});
