/**
 * Parser de TSV, sin dependencias.
 *
 * Por qué propio y no una librería de CSV: el registro IANA de
 * `text/tab-separated-values` (1993) **prohíbe** tabuladores y saltos de línea
 * dentro de los campos, y **no define ningún mecanismo de entrecomillado**.
 * Las librerías de CSV existen para resolver el entrecomillado; en TSV ese
 * problema no existe por definición, y separar por tabulador es el parseo
 * correcto, no un atajo.
 *
 * Lo que sí hace falta es verificar la premisa. Si un día una fuente regenera
 * el archivo con un tabulador adentro de un campo, la cantidad de columnas de
 * esa línea no va a coincidir: el parser corta el build con el número de línea
 * en vez de corromper el dato en silencio.
 *
 * OJO: esto NO sirve para CSV con comillas (por ejemplo los CSV del corpus OSF,
 * que traen comas adentro de las observaciones). Ese caso necesita otro parser.
 */

export interface OpcionesTsv {
	/** Nombre del archivo, sólo para los mensajes de error. */
	nombre: string;
	/** Columnas que el pipeline necesita. Si falta alguna, falla. */
	columnas: readonly string[];
}

/** Una fila cruda: nombre de columna → valor, todo string. */
export type FilaTsv = Record<string, string>;

/**
 * Parsea un TSV con encabezado.
 *
 * @param contenido  El archivo entero como texto UTF-8.
 * @param opciones   Nombre (para errores) y columnas requeridas.
 * @returns          Una fila por registro, sin el encabezado.
 * @throws           Si el archivo está vacío, si falta una columna requerida o
 *                   si alguna línea no tiene la cantidad de campos del encabezado.
 */
export function parsearTsv(contenido: string, opciones: OpcionesTsv): FilaTsv[] {
	// El BOM rompe el nombre de la primera columna sin que se vea en pantalla.
	const texto = contenido.replace(/^\uFEFF/, '');

	// Los dos archivos del proyecto difieren: IDS viene con CRLF y Concepticon
	// con LF. Se normaliza antes de partir.
	const lineas = texto.split(/\r\n|\n|\r/);

	const encabezado = lineas[0];
	if (encabezado === undefined || encabezado.trim() === '') {
		throw new Error(`${opciones.nombre}: el archivo está vacío o no tiene encabezado.`);
	}

	const columnas = encabezado.split('\t');

	for (const requerida of opciones.columnas) {
		if (!columnas.includes(requerida)) {
			throw new Error(
				`${opciones.nombre}: falta la columna "${requerida}". ` +
					`El archivo trae: ${columnas.join(', ')}. ` +
					`Si la fuente cambió su formato, hay que revisar el transformador antes de seguir.`
			);
		}
	}

	const filas: FilaTsv[] = [];

	for (let i = 1; i < lineas.length; i++) {
		const linea = lineas[i];
		if (linea === undefined || linea === '') continue; // línea final vacía

		const campos = linea.split('\t');

		if (campos.length !== columnas.length) {
			throw new Error(
				`${opciones.nombre}, línea ${i + 1}: tiene ${campos.length} campos y el ` +
					`encabezado declara ${columnas.length}. ` +
					`En TSV un campo no puede contener tabuladores ni saltos de línea (IANA), ` +
					`así que esto significa que el archivo cambió de formato o está corrupto.`
			);
		}

		const fila: FilaTsv = {};
		for (let c = 0; c < columnas.length; c++) {
			const nombre = columnas[c];
			if (nombre === undefined) continue;
			fila[nombre] = campos[c] ?? '';
		}

		filas.push(fila);
	}

	return filas;
}

/**
 * Lee una columna de una fila ya validada.
 *
 * `parsearTsv` garantiza que la columna existe, pero TypeScript no puede saberlo
 * con `noUncheckedIndexedAccess`. Este helper cierra ese hueco sin `as`.
 */
export function campo(fila: FilaTsv, clave: string): string {
	const valor = fila[clave];
	if (valor === undefined) {
		throw new Error(`La fila no tiene la columna "${clave}".`);
	}
	return valor;
}
