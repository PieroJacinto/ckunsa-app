import { describe, expect, it } from 'vitest';

import type { Buscador } from '$lib/datos/cargador';
import type { Entrada, Fuente, Manifest } from '$lib/domain/tipos';

import { crearDiccionario } from './diccionario.svelte';

const MANIFEST: Manifest = {
	version: 1,
	generado: 'huella',
	archivos: { entradas: 'e.json', fuentes: 'f.json', morfemas: 'm.json' },
	conteos: { entradas: 2, fuentes: 1, morfemas: 0 }
};

const ENTRADAS: Entrada[] = [
	{
		id: 'tama-caliente',
		forma_clck: 'tama',
		clave_canonica: 'tama',
		clave_historica: 'TaMa',
		significados: ['caliente'],
		categoria: 'desconocida',
		nivel_evidencia: 'atestiguada',
		fuentes: ['f1'],
		estructura: 'pendiente',
		estado: 'activa'
	},
	{
		id: 'puri-agua',
		forma_clck: 'puri',
		clave_canonica: 'puri',
		clave_historica: 'Puri',
		significados: ['agua'],
		categoria: 'desconocida',
		nivel_evidencia: 'atestiguada',
		fuentes: ['f1'],
		estructura: 'pendiente',
		estado: 'retirada',
		motivo_retiro: 'restricción comunitaria'
	}
];

const FUENTES: Fuente[] = [
	{
		id: 'f1',
		cita: 'Fuente de prueba',
		cita_corta: 'Prueba (2021)',
		anio: 2021,
		tipo: 'primaria',
		licencia: 'CC BY 4.0',
		autoridad_normativa: false
	}
];

function fake(version = 1): Buscador {
	return async (url) => {
		const archivo = url.split('/').pop() ?? '';
		const cuerpos: Record<string, unknown> = {
			'manifest.json': { ...MANIFEST, version },
			'e.json': ENTRADAS,
			'f.json': FUENTES,
			'm.json': []
		};

		const cuerpo = cuerpos[archivo];
		if (cuerpo === undefined) return new Response('', { status: 404 });

		return new Response(JSON.stringify(cuerpo), { status: 200 });
	};
}

const roto: Buscador = async () => {
	throw new Error('offline');
};

async function listo() {
	const d = crearDiccionario();
	await d.cargar({ fetch: fake() });
	return d;
}

describe('ciclo de carga', () => {
	it('arranca inicial y sin error', () => {
		const d = crearDiccionario();

		expect(d.estado).toBe('inicial');
		expect(d.error).toBeNull();
	});

	it('queda listo después de cargar', async () => {
		expect((await listo()).estado).toBe('listo');
	});

	it('expone el total de entradas', async () => {
		expect((await listo()).total).toBe(2);
	});

	it('expone la versión cargada', async () => {
		expect((await listo()).versionCargada).toBe(1);
	});

	it('sin datos, el total es cero', () => {
		expect(crearDiccionario().total).toBe(0);
	});

	/**
	 * En Atacama la señal no se da por sentada. El estado de error es un camino
	 * previsto, no una excepción rara, y tiene que traer el motivo.
	 */
	it('un error de red deja estado error con mensaje', async () => {
		const d = crearDiccionario();
		await d.cargar({ fetch: roto });

		expect(d.estado).toBe('error');
		expect(d.error).toContain('offline');
	});

	it('reintentar después de un error limpia el error', async () => {
		const d = crearDiccionario();
		await d.cargar({ fetch: roto });
		await d.cargar({ fetch: fake() });

		expect(d.estado).toBe('listo');
		expect(d.error).toBeNull();
	});
});

describe('búsqueda', () => {
	it('sin consulta no hay resultados', async () => {
		expect((await listo()).resultados).toEqual([]);
	});

	it('la consulta se refleja en el estado', async () => {
		const d = await listo();
		d.buscar('tama');

		expect(d.consulta).toBe('tama');
	});

	it('devuelve resultados del dominio', async () => {
		const d = await listo();
		d.buscar('caliente');

		expect(d.resultados.map((r) => r.entrada.forma_clck)).toEqual(['tama']);
	});

	it('recalcula al cambiar la consulta', async () => {
		const d = await listo();
		d.buscar('tama');
		const antes = d.resultados.length;
		d.buscar('zzzz');

		expect(antes).toBe(1);
		expect(d.resultados).toEqual([]);
	});

	it('buscar antes de cargar no rompe', () => {
		const d = crearDiccionario();
		d.buscar('tama');

		expect(d.resultados).toEqual([]);
	});

	it('las retiradas no aparecen en los resultados', async () => {
		const d = await listo();
		d.buscar('puri');

		expect(d.resultados).toEqual([]);
	});
});

describe('acceso a fichas y fuentes', () => {
	it('porId devuelve la entrada', async () => {
		expect((await listo()).porId('tama-caliente')?.forma_clck).toBe('tama');
	});

	it('porId de un id inexistente devuelve undefined', async () => {
		expect((await listo()).porId('no-existe')).toBeUndefined();
	});

	/** Quien busca una forma retirada tiene que encontrar la explicación. */
	it('fichaDe encuentra la retirada con su motivo', async () => {
		expect((await listo()).fichaDe('puri')[0]?.motivo_retiro).toBe('restricción comunitaria');
	});

	it('fuente devuelve la cita y la licencia', async () => {
		expect((await listo()).fuente('f1')?.licencia).toBe('CC BY 4.0');
	});

	it('fuentes lista todas', async () => {
		expect((await listo()).fuentes()).toHaveLength(1);
	});

	it('sin cargar, fuentes devuelve lista vacía', () => {
		expect(crearDiccionario().fuentes()).toEqual([]);
	});
});

describe('actualizaciones', () => {
	it('sin revisar no hay actualización', async () => {
		expect((await listo()).hayActualizacion).toBe(false);
	});

	it('la misma versión no es una actualización', async () => {
		const d = await listo();
		await d.revisarActualizacion({ fetch: fake(1) });

		expect(d.hayActualizacion).toBe(false);
	});

	it('una versión mayor sí lo es', async () => {
		const d = await listo();
		await d.revisarActualizacion({ fetch: fake(2) });

		expect(d.hayActualizacion).toBe(true);
	});

	/** Avisa, pero no recarga sola: la decisión es del usuario. */
	it('no recarga sola: el corpus sigue en la versión vieja', async () => {
		const d = await listo();
		await d.revisarActualizacion({ fetch: fake(2) });

		expect(d.versionCargada).toBe(1);
	});

	it('si el chequeo falla, no ensucia el estado', async () => {
		const d = await listo();
		await d.revisarActualizacion({ fetch: roto });

		expect(d.estado).toBe('listo');
		expect(d.error).toBeNull();
	});
});

describe('aplicarActualizacion — no puede romper lo que anda', () => {
	/**
	 * El caso que importa: alguien está usando el diccionario, aparece el aviso
	 * de palabras nuevas, toca actualizar y justo se queda sin señal. Si eso
	 * dejara el store en error, la app mostraría una pantalla rota teniendo el
	 * corpus entero en memoria.
	 */
	it('si falla, conserva el corpus que ya estaba cargado', async () => {
		const d = crearDiccionario();
		await d.cargar({ fetch: fake() });

		expect(d.estado).toBe('listo');
		const totalPrevio = d.total;

		await d.aplicarActualizacion({
			fetch: () => Promise.reject(new Error('sin conexión'))
		});

		expect(d.estado).toBe('listo');
		expect(d.total).toBe(totalPrevio);
	});

	it('si sale bien, deja de anunciar la actualización', async () => {
		const d = crearDiccionario();
		await d.cargar({ fetch: fake() });
		await d.revisarActualizacion({ fetch: fake(2) });

		expect(d.hayActualizacion).toBe(true);

		await d.aplicarActualizacion({ fetch: fake(2) });

		expect(d.hayActualizacion).toBe(false);
	});
});
