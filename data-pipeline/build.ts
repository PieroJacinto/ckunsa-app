/**
 * Construye los JSON del corpus desde las fuentes crudas.
 *
 * Esta es la parte sucia del pipeline: lee del disco y escribe al disco. Toda
 * la lógica que decide qué afirma la app sobre la lengua vive en
 * `transformadores/`, que es puro y testeado. Acá no hay reglas lingüísticas.
 *
 * Se ejecuta con Node directamente (`node data-pipeline/build.ts`): desde la
 * v24 el type stripping viene activado por defecto y no hace falta `tsx` ni
 * ningún otro ejecutor. Node borra los tipos y corre el JavaScript; NO hace
 * typecheck, para eso está `npm run check:pipeline`.
 *
 * Los imports llevan extensión `.ts` explícita porque Node no la infiere.
 *
 * IDEMPOTENTE: correrlo dos veces produce archivos byte a byte idénticos. Si
 * no, hay un bug. Por eso el manifest no lleva timestamp (ver `huella`).
 */

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Corpus, Manifest, Morfema } from '../src/lib/domain/tipos.ts';
import { campo, parsearTsv, type FilaTsv } from './tsv.ts';
import { transformarIds, type FilaConcepto, type FilaIds } from './transformadores/ids.ts';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..');
const CRUDAS = join(AQUI, 'fuentes-crudas');
const SALIDA = join(RAIZ, 'static', 'data');

/**
 * Versión del corpus. Se bumpea a mano cuando cambia la FORMA de los datos, no
 * cuando cambia el contenido: los archivos publicados son forward-only y la app
 * compara esta versión con la que tiene cacheada (`01-ARQUITECTURA` §7).
 */
const VERSION_CORPUS = 1;

const COLUMNAS_IDS = [
	'id_ids',
	'forma',
	'valor_original',
	'concepto_en',
	'concepticon_gloss',
	'concepticon_id',
	'capitulo_id',
	'capitulo',
	'comentario'
] as const;

const COLUMNAS_CONCEPTOS = [
	'IDS_ID',
	'ENGLISH',
	'SPANISH',
	'CONCEPTICON_ID',
	'CONCEPTICON_GLOSS',
	'CHAPTER'
] as const;

function leerTsv(archivo: string, columnas: readonly string[]): FilaTsv[] {
	const ruta = join(CRUDAS, archivo);

	let contenido: string;
	try {
		contenido = readFileSync(ruta, 'utf-8');
	} catch {
		throw new Error(
			`No se pudo leer ${ruta}.\n` +
				`Las fuentes crudas no se versionan automáticamente: si falta, hay que bajarla ` +
				`de nuevo. Ver 04-DATOS-Y-FUENTES.md §1.`
		);
	}

	return parsearTsv(contenido, { nombre: archivo, columnas });
}

function aFilaIds(f: FilaTsv): FilaIds {
	return {
		id_ids: campo(f, 'id_ids'),
		forma: campo(f, 'forma'),
		valor_original: campo(f, 'valor_original'),
		concepto_en: campo(f, 'concepto_en'),
		concepticon_gloss: campo(f, 'concepticon_gloss'),
		concepticon_id: campo(f, 'concepticon_id'),
		capitulo_id: campo(f, 'capitulo_id'),
		capitulo: campo(f, 'capitulo'),
		comentario: campo(f, 'comentario')
	};
}

function aFilaConcepto(f: FilaTsv): FilaConcepto {
	return {
		IDS_ID: campo(f, 'IDS_ID'),
		ENGLISH: campo(f, 'ENGLISH'),
		SPANISH: campo(f, 'SPANISH'),
		CONCEPTICON_ID: campo(f, 'CONCEPTICON_ID'),
		CONCEPTICON_GLOSS: campo(f, 'CONCEPTICON_GLOSS'),
		CHAPTER: campo(f, 'CHAPTER')
	};
}

/** Tabulado y con salto final, para que el `git diff` de los datos sea legible. */
function json(valor: unknown): string {
	return JSON.stringify(valor, null, '\t') + '\n';
}

function escribir(archivo: string, contenido: string): void {
	mkdirSync(SALIDA, { recursive: true });
	writeFileSync(join(SALIDA, archivo), contenido, 'utf-8');
}

/**
 * Huella del contenido, no fecha de generación.
 *
 * Un timestamp haría que cada corrida ensucie el `git diff` aunque los datos no
 * hayan cambiado, y rompería la idempotencia que exige `03-MODELO-DE-DATOS` §7.
 * Con un hash del contenido, el manifest cambia si y sólo si cambió el corpus —
 * que es exactamente cuando la app tiene que bajar datos nuevos.
 */
function huella(...contenidos: string[]): string {
	const h = createHash('sha256');
	for (const c of contenidos) h.update(c);
	return h.digest('hex').slice(0, 16);
}

export function construir(): { corpus: Corpus; manifest: Manifest } {
	const filasIds = leerTsv('ids-kunza-lehnert.tsv', COLUMNAS_IDS).map(aFilaIds);
	const filasConceptos = leerTsv('concepticon-Key-2016-1310.tsv', COLUMNAS_CONCEPTOS).map(
		aFilaConcepto
	);

	const { entradas, fuentes } = transformarIds(filasIds, filasConceptos);

	// Todavía no hay morfemas: salen de Peyró (2005) en la fase 3. El archivo se
	// escribe igual, vacío, para que el cargador no tenga que manejar su ausencia.
	const morfemas: Morfema[] = [];

	const corpus: Corpus = { version: VERSION_CORPUS, entradas, fuentes, morfemas };

	const jsonEntradas = json(entradas);
	const jsonFuentes = json(fuentes);
	const jsonMorfemas = json(morfemas);

	const manifest: Manifest = {
		version: VERSION_CORPUS,
		generado: huella(jsonEntradas, jsonFuentes, jsonMorfemas),
		archivos: {
			entradas: `entradas.v${VERSION_CORPUS}.json`,
			fuentes: `fuentes.v${VERSION_CORPUS}.json`,
			morfemas: `morfemas.v${VERSION_CORPUS}.json`
		},
		conteos: {
			entradas: entradas.length,
			fuentes: fuentes.length,
			morfemas: morfemas.length
		}
	};

	escribir(manifest.archivos.entradas, jsonEntradas);
	escribir(manifest.archivos.fuentes, jsonFuentes);
	escribir(manifest.archivos.morfemas, jsonMorfemas);
	escribir('manifest.json', json(manifest));

	return { corpus, manifest };
}

const { manifest } = construir();

console.log(`corpus v${manifest.version} · huella ${manifest.generado}`);
console.log(`  entradas: ${manifest.conteos.entradas}`);
console.log(`  fuentes:  ${manifest.conteos.fuentes}`);
console.log(`  morfemas: ${manifest.conteos.morfemas}`);