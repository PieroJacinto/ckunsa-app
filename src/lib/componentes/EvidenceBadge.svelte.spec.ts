import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import { ETIQUETA_NIVEL, NOTA_GRAFIA_PROVISIONAL } from '$lib/domain/evidencia';

import EvidenceBadge from './EvidenceBadge.svelte';

/**
 * Chromium real, vía Playwright. Deliberadamente CORTO: acá va sólo lo que
 * necesita un DOM de verdad —visibilidad, texto accesible—, porque cada test de
 * este archivo cuesta segundos. Todo lo que se puede verificar sobre el marcado
 * está en `EvidenceBadge.spec.ts`, que corre en milisegundos.
 */

const forma = (texto: string) =>
	createRawSnippet(() => ({ render: () => `<span>${texto}</span>` }));

describe('EvidenceBadge en el navegador', () => {
	it('la forma en ckunsa es visible', async () => {
		const screen = render(EvidenceBadge, {
			nivel: 'atestiguada',
			children: forma('ckabur')
		});

		await expect.element(screen.getByText('ckabur')).toBeVisible();
	});

	/**
	 * La palabra del nivel tiene que ser TEXTO visible, no un atributo ni un
	 * pseudo-elemento: es lo que lee alguien que no distingue los colores.
	 */
	it('la palabra del nivel es texto visible', async () => {
		const screen = render(EvidenceBadge, {
			nivel: 'reconstruida',
			children: forma('tanatur')
		});

		await expect.element(screen.getByText(ETIQUETA_NIVEL.reconstruida)).toBeVisible();
	});

	it('la nota de grafía provisional se ve cuando corresponde', async () => {
		const screen = render(EvidenceBadge, {
			nivel: 'atestiguada',
			grafiaProvisional: true,
			children: forma('caur')
		});

		await expect.element(screen.getByText(NOTA_GRAFIA_PROVISIONAL)).toBeVisible();
	});

	/**
	 * El test que atrapa la regresión que más importa: que una forma no llegue
	 * nunca a la pantalla sin su marca de evidencia.
	 */
	it('nunca renderiza la forma sin su marca al lado', async () => {
		const screen = render(EvidenceBadge, {
			nivel: 'propuesta',
			children: forma('ckunsa')
		});

		await expect.element(screen.getByText('ckunsa')).toBeVisible();
		await expect.element(screen.getByText(ETIQUETA_NIVEL.propuesta)).toBeVisible();
	});
});
