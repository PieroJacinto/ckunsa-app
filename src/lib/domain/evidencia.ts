/**
 * Reglas de qué significa cada nivel de evidencia y cómo se anuncia.
 *
 * TypeScript puro: sin Svelte, sin DOM. El componente `EvidenceBadge` recibe
 * esto ya resuelto y sólo renderiza (`01-ARQUITECTURA` §3).
 *
 * Los cuatro niveles son un enum CERRADO (D7): agregar uno es decisión de la
 * comunidad, no un cambio de código. Por eso las tablas de acá son exhaustivas
 * y TypeScript falla si alguien agrega un nivel y se olvida de describirlo.
 */

import type { NivelEvidencia } from './tipos';

/** Nombre visible del nivel. Va escrito en el badge, no sólo el color. */
export const ETIQUETA_NIVEL: Record<NivelEvidencia, string> = {
	atestiguada: 'atestiguada',
	unificada: 'unificada',
	reconstruida: 'reconstruida',
	propuesta: 'propuesta'
};

/**
 * Explicación en una línea, en lenguaje llano.
 *
 * El destinatario es un chico de escuela o un docente, no un lingüista: dice
 * qué respaldo tiene la forma, sin jerga.
 */
export const DESCRIPCION_NIVEL: Record<NivelEvidencia, string> = {
	atestiguada: 'Aparece tal cual en una fuente documental.',
	unificada: 'Forma del Diccionario Unificado del Consejo Lingüístico Ckunsa.',
	reconstruida: 'No está documentada así: sale de un análisis o de aplicar una regla.',
	propuesta: 'La propuso la comunidad o un educador. No tiene respaldo documental.'
};

/** Clave del ícono que dibuja el componente. Cuatro SVG inline, sin librería. */
export type IconoNivel = 'libro' | 'tilde' | 'herramienta' | 'comunidad';

export const ICONO_NIVEL: Record<NivelEvidencia, IconoNivel> = {
	atestiguada: 'libro',
	unificada: 'tilde',
	reconstruida: 'herramienta',
	propuesta: 'comunidad'
};

/**
 * ¿El nivel exige que el usuario sepa que la forma NO está documentada tal cual?
 *
 * `reconstruida` y `propuesta` son producto de análisis o de acuerdo, no
 * registro. La UI las muestra con más advertencia.
 */
export function requiereAdvertencia(nivel: NivelEvidencia): boolean {
	return nivel === 'reconstruida' || nivel === 'propuesta';
}

/** Nota de la segunda marca: la grafía, que es un eje distinto (`03` §2.4). */
export const NOTA_GRAFIA_PROVISIONAL = 'grafía de la fuente, pendiente de normalización';
