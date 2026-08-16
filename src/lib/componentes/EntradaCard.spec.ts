import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import type { Entrada, Fuente } from '$lib/domain/tipos';

import EntradaCard from './EntradaCard.svelte';

const CKABUR: Entrada = {
	id: 'ckabur-montana',
	forma_clck: 'ckabur',
	grafia_provisional: true,
	clave_canonica: 'ckabur',
	clave_historica: 'KaBur',
	significados: ['montaña', 'loma'],
	categoria: 'desconocida',
	campo_semantico: 'El mundo físico',
	nivel_evidencia: 'atestiguada',
	fuentes: ['ids-lehnert-2021'],
	estructura: 'pendiente',
	estado: 'activa'
};

const FUENTE: Fuente = {
	id: 'ids-lehnert-2021',
	cita: 'Lehnert Santander, R. (2021). Kunza Dictionary. Intercontinental Dictionary Series.',
	cita_corta: 'Lehnert (2021)',
	anio: 2021,
	tipo: 'primaria',
	licencia: 'CC BY 4.0',
	autoridad_normativa: false
};

const marcado = (props: Record<string, unknown> = {}) =>
	render(EntradaCard, { props: { entrada: CKABUR, ...props } }).body;

describe('EntradaCard — contenido', () => {
	it('muestra la forma en ckunsa', () => {
		expect(marcado()).toContain('ckabur');
	});

	it('muestra todos los significados', () => {
		expect(marcado()).toContain('montaña, loma');
	});

	it('muestra el campo semántico cuando lo hay', () => {
		expect(marcado()).toContain('El mundo físico');
	});

	it('funciona sin campo semántico', () => {
		const sinCampo: Entrada = { ...CKABUR, campo_semantico: undefined };

		expect(marcado({ entrada: sinCampo })).toContain('ckabur');
	});

	it('enlaza a la ficha de la palabra', () => {
		expect(marcado()).toContain('/palabra/ckabur-montana');
	});
});

describe('EntradaCard — la forma nunca va suelta', () => {
	/**
	 * Regla 1 del proyecto: toda forma en ckunsa pasa por EvidenceBadge. Si
	 * alguien sacara ese envoltorio, una forma reconstruida se vería igual que
	 * una documentada y un chico la copiaría como dato firme.
	 */
	it('la envuelve en EvidenceBadge, con la marca del nivel', () => {
		expect(marcado()).toContain('evidencia__marca--atestiguada');
	});

	it('la marca sigue al nivel de la entrada', () => {
		const propuesta: Entrada = { ...CKABUR, nivel_evidencia: 'propuesta' };

		expect(marcado({ entrada: propuesta })).toContain('evidencia__marca--propuesta');
	});

	it('propaga la nota de grafía provisional', () => {
		expect(marcado()).toContain('pendiente de normalización');
	});

	it('no la muestra si la grafía no es provisional', () => {
		const canonica: Entrada = { ...CKABUR, grafia_provisional: false };

		expect(marcado({ entrada: canonica })).not.toContain('pendiente de normalización');
	});
});

describe('EntradaCard — motivo de coincidencia', () => {
	/** Decirle "coincidencia exacta" a quien buscó la palabra exacta es ruido. */
	it('no anuncia nada cuando la coincidencia fue exacta', () => {
		expect(marcado({ motivo: 'exacta' })).not.toContain('ficha__coincidencia');
	});

	it('tampoco cuando entró por significado en español', () => {
		expect(marcado({ motivo: 'espanol' })).not.toContain('ficha__coincidencia');
	});

	/** Lo didáctico es explicar la coincidencia que el usuario NO esperaba. */
	it('anuncia la aproximada', () => {
		expect(marcado({ motivo: 'aproximada' })).toContain('ficha__coincidencia');
	});

	it('prefiere el detalle puntual del buscador si viene', () => {
		const html = marcado({
			motivo: 'aproximada',
			detalle: 'coincide con la grafía histórica de "cabur"'
		});

		expect(html).toContain('coincide con la grafía histórica de');
	});

	it('sin motivo no muestra nada', () => {
		expect(marcado()).not.toContain('ficha__coincidencia');
	});
});

describe('EntradaCard — entradas retiradas', () => {
	const retirada: Entrada = {
		...CKABUR,
		estado: 'retirada',
		motivo_retiro: 'restricción comunitaria'
	};

	/**
	 * Nunca se borra una entrada: quien la busca tiene que encontrar la
	 * explicación, no una pantalla vacía (`03-MODELO-DE-DATOS` §5).
	 */
	it('avisa que fue retirada y por qué', () => {
		const html = marcado({ entrada: retirada });

		expect(html).toContain('fue retirada');
		expect(html).toContain('restricción comunitaria');
	});

	it('una entrada activa no muestra ese aviso', () => {
		expect(marcado()).not.toContain('fue retirada');
	});
});

describe('EntradaCard — atribución', () => {
	/** En un listado la cita va compacta, pero nunca desaparece. */
	it('cita la fuente en formato compacto', () => {
		const html = marcado({ fuente: FUENTE });

		expect(html).toContain('Lehnert (2021)');
		expect(html).not.toContain('Intercontinental Dictionary Series');
	});

	it('la cita compacta enlaza al dato completo', () => {
		expect(marcado({ fuente: FUENTE })).toContain('/fuentes#ids-lehnert-2021');
	});

	it('sin fuente, la tarjeta igual renderiza', () => {
		expect(marcado()).toContain('ckabur');
	});
});
