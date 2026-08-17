import { describe, expect, it } from 'vitest';

import { crearDiccionario } from './diccionario.svelte';

/**
 * `setContext` y `getContext` sólo funcionan durante la inicialización de un
 * componente, así que la integración real se verifica en las rutas. Acá se
 * cubre lo que sí es testeable de forma aislada: que la instancia por defecto
 * sea un diccionario válido y que la inyección para tests funcione.
 */

describe('proveerDiccionario — instancia por defecto', () => {
	it('crea un diccionario en estado inicial', () => {
		const d = crearDiccionario();

		expect(d.estado).toBe('inicial');
		expect(d.total).toBe(0);
	});

	/**
	 * Dos instancias independientes es exactamente lo que el patrón garantiza:
	 * si fueran la misma, dos usuarios compartirían la consulta de búsqueda.
	 */
	it('dos instancias no comparten estado', () => {
		const a = crearDiccionario();
		const b = crearDiccionario();

		a.buscar('ckabur');

		expect(a.consulta).toBe('ckabur');
		expect(b.consulta).toBe('');
	});
});
