/**
 * Validador del corpus. Corre en el build y antes de publicar.
 *
 * Es el equivalente al typecheck para los datos: barato, automático, y ataja
 * los errores que importan. Reglas en `03-MODELO-DE-DATOS.md` §7.
 *
 * `validar()` es puro y testeable. El CLI de abajo sólo corre cuando el archivo
 * se ejecuta directamente, para que importarlo desde un test no dispare un
 * `process.exit`.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
	CONSONANTES,
	VOCALES,
	VOCALES_GEMINADAS,
	canonizar,
	historizar
} from '../src/lib/domain/normalizacion.ts';
import type { Corpus, Entrada, Morfema } from '../src/lib/domain/tipos.ts';

/**
 * Colisiones de `clave_canonica` aceptadas hoy. MEDIDO sobre las 851 entradas
 * de IDS, no estimado.
 *
 * Colisionar no es un error: `canonizar()` fusiona a propósito las variantes de
 * guionado y las geminadas vocálicas (`cka-bar` / `ckaabar`). Lo que este
 * número protege es que el count no CREZCA sin que nadie se dé cuenta: si sube,
 * alguien aflojó una regla de normalización y el diccionario empezó a fusionar
 * palabras distintas.
 *
 * Caso a revisar con el CLCK: `humar` 'nudo' y `húmar` 'vacío' caen en la misma
 * clave. Si la tilde fuera fonémica serían dos palabras. Sin las reglas de
 * acentuación del Grafemario (B1) no se puede decidir.
 */
export const BASELINE_COLISIONES = 37;

export interface Problema {
	nivel: 'error' | 'aviso';
	regla: string;
	mensaje: string;
	id?: string;
}

/** Grafemas del inventario, de más largo a más corto: `tck` antes que `t`. */
const GRAFEMAS = [...CONSONANTES, ...VOCALES_GEMINADAS, ...VOCALES].sort(
	(a, b) => b.length - a.length
);

/** Caracteres de la forma que no pertenecen al inventario CLCK (§3.1). */
export function grafemasAjenos(forma: string): string[] {
	let resto = canonizar(forma);
	for (const g of GRAFEMAS) resto = resto.split(g).join('');
	return [...new Set(resto)];
}

export function tieneTilde(forma: string): boolean {
	return /[\u0300-\u036f]/.test(forma.normalize('NFD'));
}

function validarEntradas(entradas: Entrada[], idsFuentes: Set<string>): Problema[] {
	const problemas: Problema[] = [];
	const vistos = new Set<string>();
	const porCanonica = new Map<string, number>();

	for (const e of entradas) {
		const err = (regla: string, mensaje: string) =>
			problemas.push({ nivel: 'error', regla, mensaje, id: e.id });

		if (vistos.has(e.id)) err('id-duplicado', `id repetido: "${e.id}"`);
		vistos.add(e.id);

		// Nada entra sin fuente. Es la regla 4 del proyecto.
		if (e.fuentes.length === 0) err('sin-fuente', 'no declara ninguna fuente');
		for (const f of e.fuentes) {
			if (!idsFuentes.has(f)) {
				err('fuente-inexistente', `referencia la fuente "${f}", que no existe`);
			}
		}

		if (e.significados.length === 0) err('sin-significados', 'no tiene significados');
		if (e.forma_clck.trim() === '') err('sin-forma', 'forma_clck vacía');

		// Las claves son derivadas: si no coinciden, alguien las escribió a mano
		// o cambió el algoritmo sin regenerar los datos.
		if (e.clave_canonica !== canonizar(e.forma_clck)) {
			err('clave-canonica', `clave_canonica "${e.clave_canonica}" no deriva de "${e.forma_clck}"`);
		}
		if (e.clave_historica !== historizar(e.forma_clck)) {
			err(
				'clave-historica',
				`clave_historica "${e.clave_historica}" no deriva de "${e.forma_clck}"`
			);
		}

		if (e.estado === 'retirada' && !e.motivo_retiro?.trim()) {
			err('retiro-sin-motivo', 'está retirada y no dice por qué');
		}

		// Una forma con grafemas fuera del inventario CLCK sólo se acepta si está
		// declarada como grafía de la fuente. Si no, la app estaría afirmando que
		// esa es la ortografía unificada.
		const ajenos = grafemasAjenos(e.forma_clck);
		if (ajenos.length > 0 && !e.grafia_provisional) {
			err(
				'grafema-ajeno',
				`usa ${ajenos.map((c) => `"${c}"`).join(', ')}, fuera del inventario CLCK, ` +
					`y no está marcada como grafía provisional`
			);
		}

		// No hay reglas de acentuación documentadas (B1). Una forma acentuada tiene
		// que estar marcada de algún modo: como grafía de la fuente, o con nota.
		if (tieneTilde(e.forma_clck) && !e.grafia_provisional && !e.observaciones?.trim()) {
			err('tilde-sin-nota', 'lleva tilde y no hay regla de acentuación documentada (B1)');
		}

		porCanonica.set(e.clave_canonica, (porCanonica.get(e.clave_canonica) ?? 0) + 1);
	}

	const colisiones = [...porCanonica.values()].filter((n) => n > 1).length;
	if (colisiones > BASELINE_COLISIONES) {
		problemas.push({
			nivel: 'error',
			regla: 'colisiones-baseline',
			mensaje:
				`${colisiones} colisiones de clave_canonica y el baseline es ${BASELINE_COLISIONES}. ` +
				`Si el algoritmo de normalización cambió, el cambio tiene que ser deliberado: ` +
				`revisar qué palabras se fusionaron antes de mover el baseline.`
		});
	}

	return problemas;
}

function validarMorfemas(morfemas: Morfema[], idsFuentes: Set<string>): Problema[] {
	const problemas: Problema[] = [];
	const vistos = new Set<string>();

	for (const m of morfemas) {
		const err = (regla: string, mensaje: string) =>
			problemas.push({ nivel: 'error', regla, mensaje, id: m.id });

		if (vistos.has(m.id)) err('id-duplicado', `id de morfema repetido: "${m.id}"`);
		vistos.add(m.id);

		if (m.fuentes.length === 0) err('sin-fuente', 'morfema sin fuente');
		for (const f of m.fuentes) {
			if (!idsFuentes.has(f)) {
				err('fuente-inexistente', `referencia la fuente "${f}", que no existe`);
			}
		}
	}

	return problemas;
}

/** Valida un corpus completo. Puro: no lee archivos ni escribe en consola. */
export function validar(corpus: Corpus): Problema[] {
	const idsFuentes = new Set(corpus.fuentes.map((f) => f.id));
	const problemas: Problema[] = [];

	// Las licencias no son un adorno: los datos se publican bajo ellas.
	for (const f of corpus.fuentes) {
		if (!f.licencia.trim()) {
			problemas.push({
				nivel: 'error',
				regla: 'fuente-sin-licencia',
				mensaje: 'sin licencia declarada',
				id: f.id
			});
		}
	}

	problemas.push(...validarEntradas(corpus.entradas, idsFuentes));
	problemas.push(...validarMorfemas(corpus.morfemas, idsFuentes));

	// Avisos: no rompen el build, pero dejan a la vista lo que sigue pendiente
	// del Grafemario (B1). Que el número esté en pantalla en cada build evita
	// que la deuda se vuelva invisible.
	const conTilde = corpus.entradas.filter((e) => tieneTilde(e.forma_clck)).length;
	if (conTilde > 0) {
		problemas.push({
			nivel: 'aviso',
			regla: 'tildes-pendientes',
			mensaje: `${conTilde} formas llevan tilde y no hay regla de acentuación documentada (B1)`
		});
	}

	const provisionales = corpus.entradas.filter((e) => e.grafia_provisional).length;
	if (provisionales > 0) {
		problemas.push({
			nivel: 'aviso',
			regla: 'grafia-provisional',
			mensaje: `${provisionales} de ${corpus.entradas.length} entradas no están en grafía CLCK (B1)`
		});
	}

	return problemas;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const AQUI = dirname(fileURLToPath(import.meta.url));
const DATOS = join(AQUI, '..', 'static', 'data');

function main(): void {
	const leer = <T>(archivo: string): T =>
		JSON.parse(readFileSync(join(DATOS, archivo), 'utf-8')) as T;

	const manifest = leer<{ version: number; archivos: Record<string, string> }>('manifest.json');

	const corpus: Corpus = {
		version: manifest.version,
		entradas: leer(manifest.archivos.entradas ?? ''),
		fuentes: leer(manifest.archivos.fuentes ?? ''),
		morfemas: leer(manifest.archivos.morfemas ?? '')
	};

	const problemas = validar(corpus);
	const errores = problemas.filter((p) => p.nivel === 'error');
	const avisos = problemas.filter((p) => p.nivel === 'aviso');

	for (const a of avisos) console.log(`aviso  [${a.regla}] ${a.mensaje}`);
	for (const e of errores.slice(0, 20)) {
		console.error(`ERROR  [${e.regla}] ${e.id ?? ''} ${e.mensaje}`);
	}
	if (errores.length > 20) console.error(`... y ${errores.length - 20} errores más`);

	console.log(
		`\n${corpus.entradas.length} entradas · ${errores.length} errores · ${avisos.length} avisos`
	);

	if (errores.length > 0) process.exit(1);
}

// Sólo corre si se ejecuta el archivo directamente. Importarlo desde un test no
// tiene que disparar lectura de disco ni process.exit.
const ejecutadoDirecto =
	process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (ejecutadoDirecto) main();