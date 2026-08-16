import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import { DESCRIPCION_NIVEL, ETIQUETA_NIVEL, NOTA_GRAFIA_PROVISIONAL } from '$lib/domain/evidencia';
import type { NivelEvidencia } from '$lib/domain/tipos';

import EvidenceBadge from './EvidenceBadge.svelte';

/**
 * Estos tests corren con el render de servidor, sin navegador: son
 * milisegundos y verifican lo que importa acá, que es QUÉ marcado sale.
 * Lo que necesita un DOM real está en `EvidenceBadge.svelte.spec.ts`.
 */

const NIVELES: NivelEvidencia[] = ['atestiguada', 'unificada', 'reconstruida', 'propuesta'];

/** La forma en ckunsa se pasa como snippet: el badge envuelve, no recibe texto. */
const forma = (texto: string) =>
	createRawSnippet(() => ({ render: () => `<span>${texto}</span>` }));

const marcado = (nivel: NivelEvidencia, opciones: { grafiaProvisional?: boolean } = {}) =>
	render(EvidenceBadge, {
		props: { nivel, children: forma('ckabur'), ...opciones }
	}).body;

describe('EvidenceBadge — la forma siempre se muestra', () => {
	it('renderiza la forma que recibe', () => {
		expect(marcado('atestiguada')).toContain('ckabur');
	});

	it('la muestra en cualquier nivel', () => {
		for (const nivel of NIVELES) {
			expect(marcado(nivel)).toContain('ckabur');
		}
	});
});

describe('EvidenceBadge — los tres canales', () => {
	/**
	 * WCAG 1.4.1 y `07-DISENO` V4: color + ícono + palabra escrita, siempre los
	 * tres. Un badge sin la palabra es inaccesible y además ininteligible para
	 * quien entra por primera vez.
	 */
	it('escribe la palabra del nivel, no sólo el color', () => {
		for (const nivel of NIVELES) {
			expect(marcado(nivel)).toContain(ETIQUETA_NIVEL[nivel]);
		}
	});

	it('dibuja un ícono', () => {
		for (const nivel of NIVELES) {
			expect(marcado(nivel)).toContain('<svg');
		}
	});

	it('el color viaja en la clase, no en un style inline', () => {
		for (const nivel of NIVELES) {
			const html = marcado(nivel);

			expect(html).toContain(`evidencia__marca--${nivel}`);
			expect(html).not.toContain('style=');
		}
	});
});

describe('EvidenceBadge — accesibilidad', () => {
	/** El ícono es decorativo: la palabra de al lado ya lo dice. */
	it('el ícono queda oculto para el lector de pantalla', () => {
		expect(marcado('atestiguada')).toContain('aria-hidden="true"');
	});

	it('la explicación larga va en el title', () => {
		for (const nivel of NIVELES) {
			expect(marcado(nivel)).toContain(DESCRIPCION_NIVEL[nivel]);
		}
	});
});

describe('EvidenceBadge — segunda marca: la grafía', () => {
	/**
	 * Eje distinto del nivel de evidencia (`03` §2.4): mide en qué ortografía
	 * está escrita la forma, no de dónde sale el dato. En el MVP la llevan las
	 * 851 entradas de IDS.
	 */
	it('no aparece si no se pide', () => {
		expect(marcado('atestiguada')).not.toContain(NOTA_GRAFIA_PROVISIONAL);
	});

	it('aparece cuando la grafía es provisional', () => {
		expect(marcado('atestiguada', { grafiaProvisional: true })).toContain(NOTA_GRAFIA_PROVISIONAL);
	});

	it('es independiente del nivel: convive con cualquiera', () => {
		for (const nivel of NIVELES) {
			expect(marcado(nivel, { grafiaProvisional: true })).toContain(NOTA_GRAFIA_PROVISIONAL);
		}
	});

	it('no usa las clases del nivel de evidencia', () => {
		const html = marcado('atestiguada', { grafiaProvisional: true });
		const grafia = html.slice(html.indexOf('evidencia__grafia'));

		expect(grafia).not.toContain('evidencia__marca--');
	});
});

describe('EvidenceBadge — el nivel queda expuesto para inspección', () => {
	it('lo publica en data-nivel', () => {
		for (const nivel of NIVELES) {
			expect(marcado(nivel)).toContain(`data-nivel="${nivel}"`);
		}
	});
});
