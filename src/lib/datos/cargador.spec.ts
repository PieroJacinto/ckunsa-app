import { describe, expect, it } from 'vitest';

import type { Manifest } from '$lib/domain/tipos';

import {
	ErrorDeCarga,
	cargarCorpus,
	cargarManifest,
	esManifest,
	hayVersionNueva,
	type Buscador
} from './cargador';

const MANIFEST: Manifest = {
	version: 1,
	generado: '8d11e4f2ed12ac61',
	archivos: {
		entradas: 'entradas.v1.json',
		fuentes: 'fuentes.v1.json',
		morfemas: 'morfemas.v1.json'
	},
	conteos: { entradas: 1, fuentes: 1, morfemas: 0 }
};

const CUERPOS: Record<string, unknown> = {
	'manifest.json': MANIFEST,
	'entradas.v1.json': [{ id: 'a' }],
	'fuentes.v1.json': [{ id: 'f1' }],
	'morfemas.v1.json': []
};

/** Fetch falso que anota qué se pidió y con qué opciones. */
function buscadorFalso(cuerpos: Record<string, unknown> = CUERPOS) {
	const pedidos: { url: string; cache?: string }[] = [];

	const fetch: Buscador = async (url, init) => {
		pedidos.push({ url, cache: init?.cache });

		const archivo = url.split('/').pop() ?? '';
		const cuerpo = cuerpos[archivo];

		if (cuerpo === undefined) return new Response('no está', { status: 404 });

		return new Response(JSON.stringify(cuerpo), {
			status: 200,
			headers: { 'content-type': 'application/json' }
		});
	};

	return { fetch, pedidos };
}

describe('esManifest', () => {
	it('acepta un manifest bien formado', () => {
		expect(esManifest(MANIFEST)).toBe(true);
	});

	it('rechaza cualquier otra cosa', () => {
		expect(esManifest(null)).toBe(false);
		expect(esManifest({ version: '1' })).toBe(false);
		expect(esManifest({ version: 1, archivos: { entradas: 'x' } })).toBe(false);
	});
});

describe('cargarManifest', () => {
	it('lo trae y lo devuelve', async () => {
		const { fetch } = buscadorFalso();

		await expect(cargarManifest({ fetch })).resolves.toEqual(MANIFEST);
	});

	/**
	 * El único pedido que salta la caché. Es lo que hace que subir un JSON nuevo
	 * y bumpear la versión llegue al usuario sin redeployar la app.
	 */
	it('lo pide con cache no-cache', async () => {
		const { fetch, pedidos } = buscadorFalso();
		await cargarManifest({ fetch });

		expect(pedidos[0]?.cache).toBe('no-cache');
	});

	it('usa /data por defecto', async () => {
		const { fetch, pedidos } = buscadorFalso();
		await cargarManifest({ fetch });

		expect(pedidos[0]?.url).toBe('/data/manifest.json');
	});

	it('respeta una base propia y no duplica la barra', async () => {
		const { fetch, pedidos } = buscadorFalso();
		await cargarManifest({ fetch, base: '/ckunsa/data/' });

		expect(pedidos[0]?.url).toBe('/ckunsa/data/manifest.json');
	});

	it('falla con formato inesperado', async () => {
		const { fetch } = buscadorFalso({ 'manifest.json': { hola: 'mundo' } });

		await expect(cargarManifest({ fetch })).rejects.toThrow(/formato inesperado/);
	});
});

describe('cargarCorpus', () => {
	it('arma el corpus con los tres archivos', async () => {
		const { fetch } = buscadorFalso();
		const corpus = await cargarCorpus({ fetch });

		expect(corpus.version).toBe(1);
		expect(corpus.entradas).toHaveLength(1);
		expect(corpus.fuentes).toHaveLength(1);
		expect(corpus.morfemas).toEqual([]);
	});

	it('pide los archivos que dice el manifest, no nombres hardcodeados', async () => {
		const { fetch, pedidos } = buscadorFalso();
		await cargarCorpus({ fetch });

		expect(pedidos.map((p) => p.url)).toEqual([
			'/data/manifest.json',
			'/data/entradas.v1.json',
			'/data/fuentes.v1.json',
			'/data/morfemas.v1.json'
		]);
	});

	it('no vuelve a pedir el manifest si ya se lo pasaron', async () => {
		const { fetch, pedidos } = buscadorFalso();
		await cargarCorpus({ fetch }, MANIFEST);

		expect(pedidos.map((p) => p.url)).not.toContain('/data/manifest.json');
	});

	it('los tres archivos van sin no-cache: los versiona el nombre', async () => {
		const { fetch, pedidos } = buscadorFalso();
		await cargarCorpus({ fetch }, MANIFEST);

		for (const p of pedidos) expect(p.cache).toBeUndefined();
	});

	it('falla si un archivo de datos no es una lista', async () => {
		const { fetch } = buscadorFalso({ ...CUERPOS, 'entradas.v1.json': { no: 'es lista' } });

		await expect(cargarCorpus({ fetch }, MANIFEST)).rejects.toThrow(/no son listas/);
	});
});

describe('cargarCorpus — errores', () => {
	/**
	 * En Atacama la señal no se da por sentada: quedarse sin red es un caso
	 * esperado y el error tiene que decir qué faltó, no "failed to fetch".
	 */
	it('la caída de red sale como ErrorDeCarga con la url adentro', async () => {
		const fetch: Buscador = async () => {
			throw new Error('offline');
		};

		await expect(cargarManifest({ fetch })).rejects.toBeInstanceOf(ErrorDeCarga);
		await expect(cargarManifest({ fetch })).rejects.toThrow(/manifest\.json/);
	});

	it('un 404 dice el código', async () => {
		const { fetch } = buscadorFalso({});

		await expect(cargarManifest({ fetch })).rejects.toThrow(/404/);
	});

	it('una respuesta que no es JSON lo dice', async () => {
		const fetch: Buscador = async () => new Response('<html>error</html>', { status: 200 });

		await expect(cargarManifest({ fetch })).rejects.toThrow(/no es JSON válido/);
	});
});

describe('hayVersionNueva', () => {
	it('es true cuando el servidor tiene una versión mayor', () => {
		expect(hayVersionNueva({ ...MANIFEST, version: 2 }, 1)).toBe(true);
	});

	it('es false con la misma versión', () => {
		expect(hayVersionNueva(MANIFEST, 1)).toBe(false);
	});

	it('es false si el servidor quedó atrás', () => {
		expect(hayVersionNueva(MANIFEST, 5)).toBe(false);
	});

	/** Sin nada cargado no hay "versión nueva": hay primera carga. */
	it('es false cuando todavía no se cargó nada', () => {
		expect(hayVersionNueva(MANIFEST, null)).toBe(false);
	});
});