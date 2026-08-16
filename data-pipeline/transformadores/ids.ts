/**
 * Transformador IDS → Entrada[].
 *
 * Función pura: recibe filas ya parseadas y devuelve objetos de dominio. No lee
 * ni escribe archivos — de eso se encarga `build.ts`. Así se puede testear con
 * filas reales sin tocar el disco.
 *
 * Fuente: Lehnert Santander, R. (2021) *Kunza Dictionary*, en Key & Comrie
 * (eds.), The Intercontinental Dictionary Series. MPI-EVA. CC BY 4.0.
 *
 * Glosas en español: Concepticon, lista `Key-2016-1310` (el cuestionario IDS
 * completo, adaptado de Buck 1949). CC BY 4.0.
 *
 * Reglas aplicadas: `03-MODELO-DE-DATOS.md` §2.5 y §6.2.
 */

import { canonizar, historizar } from '../../src/lib/domain/normalizacion.ts';
import type {
	Entrada,
	Fuente,
	IdentificadorExterno,
	VarianteHistorica
} from '../../src/lib/domain/tipos.ts';
// ---------------------------------------------------------------------------
// Formas de entrada (las columnas crudas de cada TSV)
// ---------------------------------------------------------------------------

/** Una fila de `ids-kunza-lehnert.tsv`. Un counterpart, no una palabra. */
export interface FilaIds {
	id_ids: string;
	forma: string;
	valor_original: string;
	concepto_en: string;
	concepticon_gloss: string;
	concepticon_id: string;
	capitulo_id: string;
	capitulo: string;
	comentario: string;
}

/** Una fila de `concepticon-Key-2016-1310.tsv`. */
export interface FilaConcepto {
	IDS_ID: string;
	ENGLISH: string;
	SPANISH: string;
	CONCEPTICON_ID: string;
	CONCEPTICON_GLOSS: string;
	CHAPTER: string;
}

export interface ResultadoTransformacion {
	entradas: Entrada[];
	fuentes: Fuente[];
}

// ---------------------------------------------------------------------------
// Fuentes que este transformador declara
// ---------------------------------------------------------------------------

export const ID_FUENTE_IDS = 'ids-lehnert-2021';
export const ID_FUENTE_CONCEPTICON = 'concepticon-key-2016';

export const FUENTE_IDS: Fuente = {
	id: ID_FUENTE_IDS,
	cita:
		'Lehnert Santander, R. (2021). Kunza Dictionary. En Key, M. R. & Comrie, B. (eds.), ' +
		'The Intercontinental Dictionary Series. Leipzig: Max Planck Institute for ' +
		'Evolutionary Anthropology.',
	cita_corta: 'Lehnert (2021)',
	anio: 2021,
	tipo: 'primaria',
	licencia: 'CC BY 4.0',
	url: 'https://ids.clld.org/contributions/308',
	autoridad_normativa: false
};

/**
 * Concepticon NO documenta el ckunsa: aporta las glosas en español de los
 * conceptos. Va como `catalogo` para que `/fuentes` no la muestre como si fuera
 * documentación de la lengua (`03-MODELO-DE-DATOS.md` §2.2).
 */
export const FUENTE_CONCEPTICON: Fuente = {
	id: ID_FUENTE_CONCEPTICON,
	cita:
		'List, J.-M., Tjuka, A., Blum, F. et al. (eds.). CLLD Concepticon. Leipzig: Max Planck ' +
		'Institute for Evolutionary Anthropology. Lista Key-2016-1310.',
	cita_corta: 'Concepticon (2016)',
	anio: 2016,
	tipo: 'catalogo',
	licencia: 'CC BY 4.0',
	url: 'https://concepticon.clld.org/contributions/Key-2016-1310',
	autoridad_normativa: false
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * `"308-1-210-1"` → `"1-210"`, que es el `IDS_ID` con el que se busca la glosa.
 *
 * El primer segmento es el `Language_ID` (308 = Kunza) y el último distingue
 * counterparts del mismo concepto.
 */
export function idsIdDeFila(idFila: string): string {
	const partes = idFila.split('-');
	const capitulo = partes[1];
	const numero = partes[2];

	if (capitulo === undefined || numero === undefined) {
		throw new Error(`id_ids con formato inesperado: "${idFila}"`);
	}

	return `${capitulo}-${numero}`;
}

/**
 * Orden numérico por segmentos. Como texto, `308-14-710` iría antes que
 * `308-2-100`, y el orden de los significados dejaría de ser estable.
 */
function compararIdIds(a: string, b: string): number {
	const sa = a.split('-').map((x) => Number.parseInt(x, 10));
	const sb = b.split('-').map((x) => Number.parseInt(x, 10));

	for (let i = 0; i < Math.max(sa.length, sb.length); i++) {
		const va = sa[i] ?? -1;
		const vb = sb[i] ?? -1;
		if (va !== vb) return va - vb;
	}

	return 0;
}

/** Slug para ids e identificadores legibles. Conserva los guiones de la fuente. */
export function slug(texto: string): string {
	return texto
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.normalize('NFC')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * Normaliza la representación Unicode a NFC.
 *
 * Las 56 formas acentuadas de IDS vienen en NFD: `cáhmor` es `c a ◌́ h m o r`,
 * con el acento como carácter combinante aparte. Un usuario que escribe en el
 * teclado produce NFC, con `á` como un solo punto de código. Los dos strings se
 * ven idénticos en pantalla y son DISTINTOS para JavaScript.
 *
 * Esto NO es normalizar ortografía (regla 6): NFC y NFD son canónicamente
 * equivalentes según Unicode, es el mismo texto en otra representación de
 * bytes. No se cambia ninguna letra ni se resuelve ninguna duda ortográfica.
 */
function aNfc(texto: string): string {
	return texto.normalize('NFC');
}

/**
 * `"montaña, loma"` → `["montaña", "loma"]`.
 *
 * Las comas separan glosas alternativas del mismo concepto, no partes de una
 * frase. Separarlas hace que buscar "loma" encuentre la entrada.
 */
function glosasEspanol(spanish: string): string[] {
	return spanish
		.split(',')
		.map((g) => g.trim())
		.filter((g) => g.length > 0);
}

function unicos(valores: string[]): string[] {
	return [...new Set(valores)];
}

// ---------------------------------------------------------------------------
// Transformación
// ---------------------------------------------------------------------------

/**
 * Convierte los counterparts de IDS en entradas de diccionario.
 *
 * **Una entrada por forma, nunca por concepto** (D12). IDS es una base
 * onomasiológica: agrupa formas bajo un concepto sin afirmar que sean la misma
 * palabra. `toco` y `ckoiba` comparten el concepto 'cave' pero son palabras
 * distintas, así que salen como dos entradas. En cambio `ckamur`, registrado
 * para 'moon' y para 'month', es una entrada con dos significados: eso es
 * colexificación y reportarla es factual.
 *
 * @param filas      Filas de `ids-kunza-lehnert.tsv`.
 * @param conceptos  Filas de `concepticon-Key-2016-1310.tsv` (glosas ES).
 * @returns          Entradas y fuentes listas para el corpus.
 * @throws           Si falta la glosa en español de algún concepto, o si dos
 *                   entradas generan el mismo `id`.
 */
export function transformarIds(
	filas: FilaIds[],
	conceptos: FilaConcepto[]
): ResultadoTransformacion {
	const glosaPorIdsId = new Map<string, FilaConcepto>();
	const glosaPorConcepticon = new Map<string, FilaConcepto>();

	for (const c of conceptos) {
		if (c.IDS_ID) glosaPorIdsId.set(c.IDS_ID, c);
		if (c.CONCEPTICON_ID) glosaPorConcepticon.set(c.CONCEPTICON_ID, c);
	}

	/** Devuelve las glosas ES del concepto de una fila. Nunca cae al inglés. */
	const glosasDe = (fila: FilaIds): string[] => {
		const concepto =
			glosaPorIdsId.get(idsIdDeFila(fila.id_ids)) ?? glosaPorConcepticon.get(fila.concepticon_id);

		if (!concepto || !concepto.SPANISH.trim()) {
			throw new Error(
				`Sin glosa en español para el concepto "${fila.concepto_en}" ` +
					`(id_ids ${fila.id_ids}, concepticon ${fila.concepticon_id}). ` +
					`No se cae al inglés: el diccionario es para escuelas de San Pedro.`
			);
		}

		return glosasEspanol(concepto.SPANISH);
	};

	// Agrupar por forma EXACTA. No por clave canónica: eso fusionaría `sem-ma`
	// con `semma` y afirmaría que son la misma palabra.
	const porForma = new Map<string, FilaIds[]>();

	for (const fila of filas) {
		const forma = aNfc(fila.forma.trim());
		if (!forma) continue; // una fila sin forma no es una palabra

		const grupo = porForma.get(forma);
		if (grupo) grupo.push(fila);
		else porForma.set(forma, [fila]);
	}

	const entradas: Entrada[] = [];
	const idsVistos = new Set<string>();

	for (const [forma, grupoSinOrden] of porForma) {
		const grupo = [...grupoSinOrden].sort((a, b) => compararIdIds(a.id_ids, b.id_ids));
		const primera = grupo[0];
		if (!primera) continue;

		const significados = unicos(grupo.flatMap(glosasDe));
		const primerSignificado = significados[0];
		if (primerSignificado === undefined) {
			throw new Error(`La forma "${forma}" quedó sin significados.`);
		}

		const id = `${slug(forma)}-${slug(primerSignificado)}`;
		if (idsVistos.has(id)) {
			throw new Error(
				`id duplicado "${id}" al procesar la forma "${forma}". ` +
					`Hay que desambiguar antes de publicar: un id es estable y no puede repetirse.`
			);
		}
		idsVistos.add(id);

		const identificadores: IdentificadorExterno[] = [
			...grupo.map((f) => ({ esquema: 'ids', valor: f.id_ids })),
			...unicos(grupo.map((f) => f.concepticon_id).filter((v) => v.length > 0)).map((valor) => ({
				esquema: 'concepticon',
				valor
			}))
		];

		// El comentario de Lehnert se repite en todas las filas del mismo concepto.
		// Se preserva VERBATIM y no se parsea: su "Also X; Y" significa "también
		// registrado para este concepto", no "variante de esta forma".
		const observaciones = unicos(
			grupo.map((f) => f.comentario.trim()).filter((c) => c.length > 0)
		).join(' | ');

		// La grafía es la de Lehnert, no la del CLCK. Se registra como variante
		// histórica con su fuente: eso es lo que habilita al validador a aceptar
		// grafemas fuera del inventario CLCK.
		const variantes: VarianteHistorica[] = [{ forma, fuente: ID_FUENTE_IDS }];

		entradas.push({
			id,
			forma_clck: forma,
			grafia_provisional: true,
			clave_canonica: canonizar(forma),
			clave_historica: historizar(forma),
			significados,
			categoria: 'desconocida', // IDS no registra categoría gramatical
			campo_semantico: primera.capitulo || undefined,
			nivel_evidencia: 'atestiguada',
			fuentes: [ID_FUENTE_IDS],
			variantes_historicas: variantes,
			identificadores_externos: identificadores,
			estructura: 'pendiente', // IDS no registra estructura morfológica
			observaciones: observaciones || undefined,
			estado: 'activa'
		});
	}

	entradas.sort((a, b) => a.id.localeCompare(b.id, 'es'));

	return { entradas, fuentes: [FUENTE_IDS, FUENTE_CONCEPTICON] };
}
