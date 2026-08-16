/**
 * El ÚNICO lugar de la app que hace fetch de los JSON del corpus
 * (`01-ARQUITECTURA` §2). Ninguna vista y ningún módulo de `domain/` importa
 * datos: los reciben ya cargados.
 *
 * Recibe `fetch` como parámetro en vez de usar el global. Eso permite testearlo
 * en Node sin red y sin mockear globales — que es la forma más común de que un
 * test pase por el motivo equivocado — y deja la puerta abierta al `fetch` de
 * SvelteKit en carga del lado del servidor.
 *
 * NO decide cuándo recargar. Sólo sabe traer. La política de cuándo revisar el
 * manifest y cuándo ofrecer la actualización es del store.
 */

import type { Corpus, Entrada, Fuente, Manifest, Morfema } from '$lib/domain/tipos';

/** La firma de `fetch` que necesitamos, nada más. */
export type Buscador = (url: string, init?: RequestInit) => Promise<Response>;

export interface OpcionesCarga {
	fetch: Buscador;
	/** Prefijo de los datos. Por defecto `/data`, que es donde los deja el build. */
	base?: string;
}

/** Error con la URL adentro: sin eso, "failed to fetch" no dice nada. */
export class ErrorDeCarga extends Error {
	readonly url: string;

	constructor(url: string, motivo: string) {
		super(`No se pudieron cargar los datos desde ${url}: ${motivo}`);
		this.name = 'ErrorDeCarga';
		this.url = url;
	}
}

const BASE_POR_DEFECTO = '/data';

function url(base: string, archivo: string): string {
	return `${base.replace(/\/$/, '')}/${archivo}`;
}

async function traerJson<T>(
	opciones: OpcionesCarga,
	archivo: string,
	sinCache: boolean
): Promise<T> {
	const destino = url(opciones.base ?? BASE_POR_DEFECTO, archivo);

	let respuesta: Response;
	try {
		respuesta = await opciones.fetch(destino, sinCache ? { cache: 'no-cache' } : undefined);
	} catch (causa) {
		// En Atacama la señal no se da por sentada: quedarse sin red es un caso
		// esperado, no una excepción rara.
		throw new ErrorDeCarga(destino, causa instanceof Error ? causa.message : 'sin conexión');
	}

	if (!respuesta.ok) throw new ErrorDeCarga(destino, `respuesta ${respuesta.status}`);

	try {
		return (await respuesta.json()) as T;
	} catch {
		throw new ErrorDeCarga(destino, 'la respuesta no es JSON válido');
	}
}

/** Chequeo de forma mínimo. La validación completa es del build, no del cliente. */
export function esManifest(valor: unknown): valor is Manifest {
	if (typeof valor !== 'object' || valor === null) return false;

	const m = valor as Partial<Manifest>;

	return (
		typeof m.version === 'number' &&
		typeof m.archivos === 'object' &&
		m.archivos !== null &&
		typeof m.archivos.entradas === 'string' &&
		typeof m.archivos.fuentes === 'string' &&
		typeof m.archivos.morfemas === 'string'
	);
}

/**
 * Trae el manifest SIN caché. Es el único pedido que salta la caché: es lo que
 * permite que subir un JSON nuevo y bumpear la versión llegue al usuario sin
 * redeployar la app (`01-ARQUITECTURA` §7).
 */
export async function cargarManifest(opciones: OpcionesCarga): Promise<Manifest> {
	const crudo = await traerJson<unknown>(opciones, 'manifest.json', true);

	if (!esManifest(crudo)) {
		throw new ErrorDeCarga(
			url(opciones.base ?? BASE_POR_DEFECTO, 'manifest.json'),
			'formato inesperado'
		);
	}

	return crudo;
}

/**
 * Trae el corpus completo. Los tres archivos van en paralelo: son independientes
 * y encadenarlos triplicaría la espera en una conexión lenta.
 *
 * @param manifest  Si ya lo tenés, pasalo y se evita el pedido extra.
 */
export async function cargarCorpus(opciones: OpcionesCarga, manifest?: Manifest): Promise<Corpus> {
	const m = manifest ?? (await cargarManifest(opciones));

	const [entradas, fuentes, morfemas] = await Promise.all([
		traerJson<Entrada[]>(opciones, m.archivos.entradas, false),
		traerJson<Fuente[]>(opciones, m.archivos.fuentes, false),
		traerJson<Morfema[]>(opciones, m.archivos.morfemas, false)
	]);

	if (!Array.isArray(entradas) || !Array.isArray(fuentes) || !Array.isArray(morfemas)) {
		throw new ErrorDeCarga(
			opciones.base ?? BASE_POR_DEFECTO,
			'los archivos de datos no son listas'
		);
	}

	return { version: m.version, entradas, fuentes, morfemas };
}

/**
 * ¿El manifest del servidor es más nuevo que lo que la app tiene cargado?
 *
 * Sólo compara. Nunca recarga sola: mostrar el aviso y esperar que el usuario
 * decida es deliberado, porque recargar de prepo mientras alguien está leyendo
 * una ficha es hostil (`01-ARQUITECTURA` §7).
 */
export function hayVersionNueva(manifest: Manifest, versionCargada: number | null): boolean {
	return versionCargada !== null && manifest.version > versionCargada;
}