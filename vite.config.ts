import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			/*
				Sitio estático puro: archivos que cualquier CDN sirve, sin servidor que
				mantener ni pagar (01-ARQUITECTURA §1).

				`fallback` es la clave para la ficha de palabra. `/palabra/[id]` es una
				ruta dinámica, y en vez de pregenerar 851 páginas HTML —una por
				palabra— se sirve un único `200.html` que resuelve el id en el
				navegador leyendo el índice que ya está en memoria.

				Por qué así: el corpus completo ya se descarga como JSON. Pregenerar
				HTML duplicaría en 851 archivos algo que ya está en 300 KB, y el
				service worker tendría que cachear las 851 páginas para funcionar
				offline. En una escuela rural eso importa.

				El costo asumido es que los buscadores no indexan cada palabra por
				separado. Para una app comunitaria offline es aceptable.
			*/
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: '200.html',
				precompress: false,
				strict: false
			})
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					// data-pipeline queda incluido a propósito: el transformador es la
					// pieza donde se puede colar una afirmación falsa sobre la lengua,
					// y sus tests tienen que correr con los del dominio.
					include: ['src/**/*.{test,spec}.{js,ts}', 'data-pipeline/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
