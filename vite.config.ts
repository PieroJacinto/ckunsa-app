import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

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
			*/
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: '200.html',
				precompress: false,
				strict: false
			})
		}),

		SvelteKitPWA({
			/*
				`prompt` y no `autoUpdate`: nunca recargar de prepo mientras alguien
				está leyendo una ficha (01-ARQUITECTURA §7). El aviso lo decide el
				usuario.
			*/
			registerType: 'prompt',
			strategies: 'generateSW',

			manifest: {
				name: 'Diccionario ckunsa',
				short_name: 'Ckunsa',
				start_url: '/',
				display: 'standalone',
				background_color: '#faf7f2',
				theme_color: '#8f4a22',
				lang: 'es',
				description: 'Diccionario de la lengua ckunsa del pueblo lickanantay.'
			},

			workbox: {
				/*
					El shell de la app va PRECACHEADO: JS, CSS, HTML y la fuente sólo
					cambian con un deploy, así que la lista generada en build siempre
					está al día. Medido: 21 entradas, 359 KB.

					OJO — los JSON del corpus NO van acá, a propósito. La lista de
					precache se genera en el BUILD: si el corpus estuviera adentro, un
					`entradas.v2.json` subido después no aparecería en ella y el service
					worker seguiría sirviendo la v1 hasta el próximo deploy. Eso rompería
					el diseño de 01-ARQUITECTURA §7, donde agregar 200 palabras es subir
					un JSON y bumpear el manifest, SIN redeploy.
				*/
				globPatterns: ['client/**/*.{js,css,html,woff2}', 'prerendered/**/*.html'],

				runtimeCaching: [
					{
						/*
							Los datos van por stale-while-revalidate: se sirven al instante
							desde la caché —también sin señal— y en paralelo se chequea si
							hay versión nueva. Cualquier versión futura del JSON se cachea
							sola, sin redeploy.
						*/
						urlPattern: ({ url }) => url.pathname.startsWith('/data/'),
						handler: 'StaleWhileRevalidate',
						options: { cacheName: 'corpus-ckunsa' }
					}
				]
			}
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
