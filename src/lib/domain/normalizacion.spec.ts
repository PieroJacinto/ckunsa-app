import { describe, expect, it } from 'vitest';

import { canonizar, historizar } from './normalizacion';

/**
 * Casos de 03-MODELO-DE-DATOS.md §3.3.
 *
 * No son casos inventados: salen de correr el algoritmo contra las 1.727
 * formas reales del corpus OSF. La tabla de pares mínimos (grupo C) es la
 * que atrapa la regresión que ya ocurrió una vez.
 */

describe('canonizar — nivel estricto', () => {
	describe('normalizaciones básicas', () => {
		it('pasa a minúsculas', () => {
			expect(canonizar('Ckabur')).toBe(canonizar('ckabur'));
		});

		it('saca acentos', () => {
			expect(canonizar('ayián')).toBe('ayian');
		});

		it('saca guiones internos', () => {
			expect(canonizar('kepi-kot')).toBe('kepikot');
		});

		it('saca espacios internos y de los bordes', () => {
			expect(canonizar('  su ci  ')).toBe('suci');
		});

		it('colapsa geminadas vocálicas', () => {
			expect(canonizar('ckaabar')).toBe('ckabar');
			expect(canonizar('leeya')).toBe('leya');
			expect(canonizar('siimi')).toBe('simi');
			expect(canonizar('ckoo')).toBe('cko');
			expect(canonizar('tuuri')).toBe('turi');
		});
	});

	/**
	 * Grupo B — variantes reales del corpus. Tienen que caer en la MISMA clave.
	 *
	 * Colapsar geminadas es seguro: las 33 colisiones que produce son todas
	 * variantes de la misma palabra, que el propio corpus marca con
	 * "Variante: ...".
	 */
	describe('variantes del corpus — misma clave_canonica', () => {
		const variantes: [string, string, string][] = [
			['ackaabi', 'ackabi', 'geminada'],
			['ckaabar', 'ckabar', 'geminada'],
			['ckaari', 'ckari', 'geminada'],
			['ckaacktur', 'ckacktur', 'geminada'],
			['ayián', 'ayian', 'acento']
		];

		it.each(variantes)('%s / %s (%s)', (a, b) => {
			expect(canonizar(a)).toBe(canonizar(b));
		});
	});

	/**
	 * Grupo C — pares mínimos. EL TEST QUE ATRAPA LA REGRESIÓN.
	 *
	 * En la grafía CLCK `h`, `th`/`tt`, `ph`/`pp`, `tch`/`tck` y `y`/`i` son
	 * contrastivos. Si alguno de estos falla, alguien aflojó una regla y el
	 * diccionario está fusionando palabras distintas.
	 *
	 * Ver 02-LINGUISTICA-CKUNSA.md §3.2.
	 */
	describe('pares mínimos — clave_canonica DISTINTA', () => {
		const paresMinimos: [string, string, string][] = [
			['atitur', 'hatitur', 'h inicial: vencer / entrar'],
			['ayián', 'hayian', 'h inicial: señorita / encendido'],
			['tchita', 'tchitah', 'h final: cordero / estómago'],
			['patha', 'patta', 'th ≠ tt: gracias / madre'],
			['ckotcho', 'ckotcko', 'tch ≠ tck: mazamorra / cráneo'],
			['ckaipi', 'ckaypi', 'y ≠ i: boca / aquí'],
			['ia', 'ya', 'y ≠ i: el / ser-estar'],
			['lehia', 'leya', 'h y y: pelado / lejos']
		];

		it.each(paresMinimos)('%s ≠ %s (%s)', (a, b) => {
			expect(canonizar(a)).not.toBe(canonizar(b));
		});
	});

	describe('no toca los contrastes del grafemario', () => {
		it('conserva la h en cualquier posición', () => {
			expect(canonizar('hatitur')).toContain('h');
			expect(canonizar('tchitah')).toContain('h');
			expect(canonizar('lehia')).toContain('h');
		});

		it('no colapsa consonantes geminadas', () => {
			expect(canonizar('patta')).toBe('patta');
			expect(canonizar('ckutta')).toBe('ckutta');
		});

		it('no convierte y en i', () => {
			expect(canonizar('ckaypi')).toBe('ckaypi');
		});
	});

	describe('idempotencia', () => {
		it('canonizar dos veces da el mismo resultado', () => {
			for (const forma of ['ckaabar', 'ayián', 'Kepi-Kot', 'tchitah']) {
				const una = canonizar(forma);
				expect(canonizar(una)).toBe(una);
			}
		});
	});
});

describe('historizar — nivel tolerante (sólo fallback)', () => {
	/**
	 * Grupo A — el nombre de la lengua.
	 *
	 * Quien aprendió con material de los 80 escribe *kunza* y tiene que
	 * encontrar *ckunsa*. Las cinco grafías en circulación caen juntas.
	 *
	 * Se comparan entre sí y no contra un literal: lo que importa es que
	 * coincidan, no cuál es la representación interna.
	 */
	it('las cinco grafías del nombre de la lengua caen en la misma clave', () => {
		const grafias = ['ckunsa', 'kunza', 'cunza', 'cunsa', 'kunsa'];
		const claves = grafias.map(historizar);
		const unicas = new Set(claves);

		expect(unicas.size).toBe(1);
	});

	describe('alternancias de las fuentes históricas', () => {
		it('ck ~ c ~ k ~ q se colapsan', () => {
			expect(historizar('ckuta')).toBe(historizar('cuta'));
			expect(historizar('ckuta')).toBe(historizar('kuta'));
		});

		it('v ~ b se colapsan', () => {
			expect(historizar('kavatur')).toBe(historizar('kabatur'));
		});

		it('t ~ tt y p ~ pp se colapsan', () => {
			expect(historizar('hata')).toBe(historizar('hatta'));
			expect(historizar('ckuta')).toBe(historizar('ckutta'));
		});

		it('th ~ tt se colapsan', () => {
			expect(historizar('patha')).toBe(historizar('patta'));
		});

		it('z ~ s se colapsan', () => {
			expect(historizar('kunza')).toBe(historizar('kunsa'));
		});

		it('la h se ignora', () => {
			expect(historizar('atitur')).toBe(historizar('hatitur'));
		});

		it('los finales -ao / -au / -u se colapsan', () => {
			expect(historizar('ckarao')).toBe(historizar('ckarau'));
			expect(historizar('ckarao')).toBe(historizar('ckaru'));
		});
	});

	/**
	 * Limitaciones conocidas del algoritmo documentado
	 * (08-CORPUS-OSF-ANALISIS.md §5).
	 *
	 * Estas alternancias están registradas en 02-LINGUISTICA-CKUNSA.md §3.3
	 * pero el algoritmo NO las cubre, y no se resuelven por analogía. Quedan
	 * fijadas como test para que el día que se decida cubrirlas (con el
	 * Grafemario del CLCK en mano, B1) el rojo avise que hay que revisarlas.
	 */
	describe('limitaciones conocidas — NO se colapsan', () => {
		it('b ~ p: ckapur ~ ckabur no coinciden', () => {
			expect(historizar('ckapur')).not.toBe(historizar('ckabur'));
		});

		it('desaparición de la bilabial: ckabur ~ caur no coinciden', () => {
			expect(historizar('ckabur')).not.toBe(historizar('caur'));
		});
	});

	/**
	 * Este nivel es deliberadamente lossy: fusiona pares mínimos. Por eso
	 * NUNCA se consulta primero, sólo cuando el nivel estricto no devolvió
	 * nada, y todo resultado se marca `aproximada`.
	 */
	describe('es lossy a propósito', () => {
		it('fusiona pares mínimos que canonizar mantiene separados', () => {
			expect(canonizar('patha')).not.toBe(canonizar('patta'));
			expect(historizar('patha')).toBe(historizar('patta'));
		});
	});

	describe('idempotencia', () => {
		it('historizar dos veces da el mismo resultado', () => {
			for (const forma of ['kunza', 'ckabur', 'hatitur', 'ckarao']) {
				const una = historizar(forma);
				expect(historizar(una)).toBe(una);
			}
		});
	});
});